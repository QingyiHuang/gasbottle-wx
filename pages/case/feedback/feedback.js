const API = require('@/utils/api')
Page({
  data: {
    names: '',
    items: [],
    fileList: [],
    fileList2: [], // 单项目处置的时候
    conclusion: {},
    caseNo: '',
    message: '',
    moduleTitle: '',
    currentCase: {},
    loading: false,
    checkList: [],
    currentObject: {},
    checked: false
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    const _this = this;
    wx.getStorage({
      key: 'feacbackCaseNo',
      success(res) {
        const {
          conclusion,
          caseNo
        } = res.data;
        _this.setData({
          caseNo,
          conclusion
        })
        API.queryCaseOperate({
          caseNo
        }).then((data) => {
          _this.setData({
            currentCase: {
              ...res.data,
              ...data
            },
            checkList: data.inspectResults || []
          })
        })
      }
    })
  },
  // 文字变化的时候
  onTextFieldChange(event) {
    let {
      deal
    } = this.data.currentObject
    deal.message = event.detail
    this.setData({
      currentObject: {
        ...this.data.currentObject,
        deal
      }
    })
  },
  //   文件上传相关
  afterRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    API.reportFiles({
      filePath: file.url,
      name: 'files',
      formData: {
        openId: wx.openId
      },
    }).then(res => {
      const {
        fileList2
      } = this.data;
      fileList2.push({
        ...file,
        url: res[0].picUrl,
        mediaId: res[0].mediaId,
        type: res[0].fileMediaType
      });
      this.setData({
        fileList2: fileList2
      });
    })
  },
  // afterDelete(e) {
  //   const {
  //     index
  //   } = e.detail;
  //   let fileList = this.data.fileList.slice(); // 创建 fileList 的副本以避免直接修改原始数据
  //   fileList.splice(index, 1);
  //   const updatedCheckList = this.data.checkList.map((item, i) => {
  //     if (i === this.data.currentObject.index) {
  //       return {
  //         ...item,
  //         picUrls: fileList.map(file => file.url)
  //       };
  //     }
  //     return item;
  //   });
  //   this.setData({
  //     fileList,
  //     checkList: updatedCheckList
  //   });
  // },
  afterDelete(e) {
    const {
      index
    } = e.detail;
    const {
      fileList2
    } = this.data;
    const updatedFileList = [
      ...fileList2.slice(0, index), // 取索引前的部分
      ...fileList2.slice(index + 1) // 取索引后的部分
    ];
    this.setData({
      fileList2: updatedFileList
    });
  },
  getSubmitParams() {
    const {
      cameraIndexCode,
      presetCode,
      flowInstanceId,
      activeTaskId,
      caseNo,
      caseType,
      gridId
    } = this.data.currentCase
    const {
      type,
      id,
      name
    } = this.data.conclusion;
    const params = {
      caseNo,
      caseType,
      optionId: id,
      optionName: name,
      type: type.replace(/-[iu]/, ''),
      message: this.data.message,
      processInstanceId: flowInstanceId,
      taskId: activeTaskId,
      gridId: gridId
    }
    if (cameraIndexCode && presetCode) {
      params.cameraIndexCode = cameraIndexCode
      params.presetCode = presetCode
    }
    return params
  },
  // 完成巡查
  finishedPatrol() {
    if (this.data.checked) {
      API.dealCase(this.getSubmitParams())
        .then(() => {
          wx.showToast({
            title: '处置成功',
            icon: 'success',
            duration: 2000
          })
          // 防止退回太快，后台数据没有更新
          setTimeout(() => {
            wx.setStorage({
              key: 'feedbackSuccess',
              data: 'feedbackSuccess',
              success() {
                wx.navigateBack({
                  delta: 2
                })
              }
            })
          }, 2000)
        }).finally(() => {
          wx.hideLoading()
        })
    }
  },
  // 当一个清单呗点击
  itemClick(e) {
    const {
      value,
      index
    } = e.currentTarget.dataset;
    this.itemClickFunc(value, index)
  },
  // 拆分点击事件
  itemClickFunc(value, index, abnormalIndex) {
    console.log('点击', value)
    let picUrls = []
    if (value && value.picUrls && value.picUrls.length) {
      (value.picUrls || []).map(item => {
        if (item.picUrl.includes('http')) {
          picUrls.push({
            url: item.picUrl,
            type: 'image'
          })
        } else {
          picUrls.push({
            url: APP.globalData.ip + item.picUrl,
            type: 'image'
          })
        }
      })
    }
    // 将反馈模块也进行赋值
    if (value && value.fileList2) {
      this.setData({
        fileList2: value.fileList2
      })
    }
    // 如果这个没选的话，则马上给他赋值默认值
    this.setData({
      currentObject: {
        ...value,
        index,
        deal: value.deal || {}
      },
      fileList: picUrls
    }, () => {
      this.setData({
        dialogShow2: true
      })
    });
  },
  // 点击检查下一条之后
  previewNext() {
    if (this.data.currentObject.index + 1 < this.data.checkList.length) {
      this.itemClickFunc(this.data.checkList[this.data.currentObject.index + 1], this.data.currentObject.index + 1)
    } else {
      this.setData({
        dialogShow2: false
      })
    }
  },
  onClose() {
    this.setData({
      dialogShow2: false
    })
  },
  onClose1() {
    this.setData({
      dialogShow2: false,
      dialogShow: false
    })
  },
  toFeedBack() {
    this.setData({
      dialogShow2: false,
      dialogShow: true
    })
  },
  // 切换下一条检查
  checkNext() {
    this.saveCurrentItem(
      () => {
        this.onClose1()
        if (this.data.currentObject.index + 1 < this.data.checkList.length) {
          this.itemClickFunc(this.data.checkList[this.data.currentObject.index + 1], this.data.currentObject.index + 1)
        } else {
          this.setData({
            dialogShow: false
          })
        }
      }
    )
  },
  // 保存当前反馈
  saveCurrentItem(func) {
    // 校验当前项目是否文字和图片都已经存在
    console.log(this.data.currentObject.deal.message, this.data.fileList2.length)
    if (!(this.data.currentObject.deal && this.data.currentObject.deal.message && this.data.fileList2 && this.data.fileList2.length)) {
      wx.showToast({
        title: '请填写说明和图片',
        icon: 'none'
      })
      return false;
    }
    // 从fileList2中拿到id
    let mediaIdArr = []
    this.data.fileList2.map(item => {
      mediaIdArr.push(item.mediaId)
    })
    // 从currentCase的processList中拿到最后一条的taskId
    let taskId = this.data.currentCase.processList[this.data.currentCase.processList.length - 1].taskId
    API.inspectHandle({
      "dealPicIds": mediaIdArr,
      "inspectId": this.data.currentObject.id,
      "instanceId": this.data.currentCase.flowInstanceId,
      "message": this.data.currentObject.deal.message,
      "openId": wx.openId,
      "taskId": taskId
    }).then(res => {
      if (res) {
        // 将fileList2和deal.message同步存在checkList中
        let checkListTemp = this.data.checkList
        checkListTemp[this.data.currentObject.index] = {
          ...checkListTemp[this.data.currentObject.index],
          deal: this.data.currentObject.deal,
          fileList2: this.data.fileList2,
          ischecked: true
        }
        // 如果checkListTemp的每一项的ischecked为true 则checked设置为true,否则为false
        this.setData({
          checked: checkListTemp.every(item => item.ischecked),
          checkList: checkListTemp,
          fileList2: [],
        })
        console.log(this.data.checkList)
        func && func()
      }
    })
  }
})