const API = require('@/utils/eApi')
const APP = getApp()
import Dialog from '@vant/weapp/dialog/dialog';
Page({
  data: {
    auditConclusion: '', // 当前巡查审核的状态
    pageType: '', // 当前巡查的进展
    isAudit: false,
    isAllStatuNonZero: true,
    checkList: [],
    detailInfo: {},
    currentObject: {},
    dialogShow: false,
    dialogShow2: false,
    dialogShow3: false,
    statu: 1, // 选择单项正常异常
    tabActive: 1, // 切换弹框的界面1或转到界面2
    fileList: [], // 文件列表
    auditActive: '', // 审核结论
    abnormalonly: false, // 只查看异常项
    abnormalArr: [], // 异常数据的下标
    abnormalIndex: 0,
    message: '',
    btnLoading: false,
    canHandle: false
  },
  onLoad(options) {
    wx.getStorage({
      key: 'patrolInfo',
      success: (res) => {
        this.setData({
          auditConclusion: res.data.auditConclusion,
          detailInfo: res.data,
          checkList: res.data.patrolItems || []
        })
        this.checkReportAbility()
      }
    })
    this.setData({
      pageType: options.type,
      isAudit: options.isaudit
    })
  },
  // 查询是否有上报权限，有的话可以点击 没有的话不让操作任何，且显示没有权限
  checkReportAbility() {
    API.checkReportAbility({
      taskId: this.data.detailInfo.id
    }).then(res =>{
      this.setData({
        canHandle: res
      })
    })
  },
  updateIsAllStatuNonZero() {
    const allStatuNonZero = this.data.checkList.every(item => Boolean(item.patrolValue));
    this.setData({
      isAllStatuNonZero: allStatuNonZero
    });
  },
  // 完成巡查
  finishedPatrol() {
    // 校验每一项是否都是该填的填完了，填完了就完成
    if (this.validateItems() && this.data.canHandle) {
      Dialog.confirm({
          title: '是否确认完成巡查？',
        })
        .then(() => {
          let that = this
          wx.getLocation({
            type: 'wgs84',
            success(res) {
              const latitude = res.latitude;
              const longitude = res.longitude;
              API.completeTask({
                "latitude": latitude,
                "longitude": longitude,
                "taskId": that.data.detailInfo.id
              }).then(res => {
                setTimeout(() => {
                  wx.setStorage({
                    key: 'feedbackSuccess',
                    data: 'feedbackSuccess',
                    success() {
                      wx.navigateBack({
                        delta: 1
                      })
                    }
                  })
                }, 1000)
              })
            },
            fail(err) {
              wx.showToast({
                title: '无法获取经纬度，不能进行巡查处置',
              })
            }
          })
        })
    }
  },
  // 当一个清单被点击后
  itemClick(e) {
    const {
      value,
      index
    } = e.currentTarget.dataset;
    this.tabGoBack()
    this.itemClickFunc(value, index)
  },
  // 拆分点击事件
  itemClickFunc(value, index, abnormalIndex) {
    let picUrls = []
    if (value && value.picUrls && value.picUrls.length) {
      (value.picUrls || []).map(item => {
        if (item.includes('http')) {
          picUrls.push({
            url: item,
            type: 'image'
          })
        } else {
          picUrls.push({
            url: APP.globalData.ip + item,
            type: 'image'
          })
        }
      })
    }
    // 如果这个没选的话，则马上给他赋值默认值
    // this.setData()
    this.setData({
      currentObject: {
        ...value,
        index
      },
      fileList: picUrls
    }, () => {
      if(this.data.abnormalonly) {
        if(abnormalIndex + 1 < this.data.abnormalArr.length) {
          this.setData({
            abnormalIndex: this.data.abnormalIndex + 1
          })
        }
      }
      if (this.data.pageType === '1') {
        // // 选择那个名字相同的orderNum
        if (this.data.currentObject.patrolValue) {
          const tempArr = JSON.parse(this.data.currentObject.itemValue)
          let aimObj = tempArr.find(item => item.value === this.data.currentObject.patrolValue)
          this.setData({
            statu: aimObj.orderNum
          })
        } else {
          // 默认选择tempArr的第一个
          const tempArr = JSON.parse(this.data.currentObject.itemValue)
          let aimObj = tempArr[0]
          const index = this.data.currentObject.index
          let arr = this.data.checkList
          arr[index].itemStatusName = aimObj.status === '1' ? '正常' : '异常'
          arr[index].itemStatus = aimObj.status
          arr[index].patrolValue = aimObj.value
          this.setData({
            statu: tempArr[0].orderNum,
            checkList: arr
          });
        }
        this.setData({
          dialogShow: true
        })
      } else {
        this.setData({
          dialogShow2: true
        })
      }
    });
  },
  // popup被关闭的时候
  onClose1() {
    // 第一个关闭时自动保存当前状态
    this.saveCurrentItem()
    this.setData({
      dialogShow: false
    })
  },
  onClose() {
    this.setData({
      dialogShow: false,
      dialogShow2: false,
      dialogShow3: false,
      abnormalonly: false
    })
  },
  // 选项变化的时候，变化对应的条目的选择结果并改变checklist
  onRadioCheck(event) {
    const {
      name
    } = event.currentTarget.dataset;
    const tempArr = JSON.parse(this.data.currentObject.itemValue)
    let aimObj = tempArr.find(item => item.orderNum === name)
    const index = this.data.currentObject.index
    let arr = this.data.checkList
    arr[index].itemStatusName = aimObj.status === '1' ? '正常' : '异常'
    arr[index].itemStatus = aimObj.status
    arr[index].patrolValue = aimObj.value
    this.setData({
      statu: name,
      checkList: arr
    });
  },
  // 检查结果描述
  tabCheckDetail() {
    this.setData({
      tabActive: 2
    })
  },
  // 返回上一步
  tabGoBack() {
    this.setData({
      tabActive: 1
    })
  },
  //   文件上传相关
  afterRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    API.uploadPics({
      filePath: file.url,
      name: 'files',
      formData: {
        openId: wx.openId
      },
    }).then(res => {
      if (res && res.length) {
        let arr = [{
          url: res[0],
          type: 'image'
        }]
        let fileList = this.data.fileList
        fileList = fileList.concat(arr)
        const {
          index
        } = this.data.currentObject
        let arr2 = this.data.checkList
        let fileArr = []
        fileList.map(one => {
          fileArr.push(one.url)
        })
        arr2[index].picUrls = fileArr
        this.setData({
          fileList: fileList,
          checkList: arr2
        })
      }
    })
  },
  afterDelete(e) {
    const { index } = e.detail;
    let fileList = this.data.fileList.slice(); // 创建 fileList 的副本以避免直接修改原始数据
    fileList.splice(index, 1);
    const updatedCheckList = this.data.checkList.map((item, i) => {
      if (i === this.data.currentObject.index) {
        return {
          ...item,
          picUrls: fileList.map(file => file.url)
        };
      }
      return item;
    });
    this.setData({
      fileList,
      checkList: updatedCheckList
    });
  },
  onAbnormalOnlyChange(event) {
    this.setData({
      abnormalonly: event.detail,
    });
    if(this.data.abnormalonly) {
      this.getAbnormalIndex()
    }
  },
  // 获取仅含异常数据的下标
  getAbnormalIndex() {
    let indices = this.data.checkList.reduce((indices, item, index) => {
      if (item.itemStatus !== "1") {
        indices.push(index);
      }
      return indices;
    }, []);
    if(indices.length <= 0) {
      wx.showToast({
        title: '没有异常项',
      })
      return 
    }
    this.setData({
      abnormalArr: indices,
      abnormalIndex: 0
    }, () => {
      this.previewNext()
    })
  },
  auditPatrol() {
    this.setData({
      dialogShow3: true
    })
  },
  auditCheck(e) {
    this.setData({
      auditActive: e.currentTarget.dataset.name
    })
  },
  // 审核接口
  auditConfirm() {
    const that = this
    if(!this.data.auditActive) {
      wx.showToast({
        title: '请选择审核结论',
        icon: 'none'
      })
      return false
    }
    if(!this.data.message) {
      wx.showToast({
        title: '请填写审核意见',
        icon: 'none'
      })
      return false
    }
    Dialog.confirm({
      title: `是否确认${that.data.auditActive === 'pass' ? '通过' : '不通过'}审核？`,
    })
    .then(() => {
      API.auditTask({
        "auditConclusion": that.data.auditActive === 'pass' ? 1 : 2,
        "auditSuggestion": that.data.message,
        "taskId": that.data.detailInfo.id
      }).then(() => {
        setTimeout(() => {
          wx.setStorage({
            key: 'feedbackSuccess',
            data: 'feedbackSuccess',
            success() {
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }, 1000)
      })
    })
  },
  // 切换下一条检查
  checkNext() {
    if (this.currentIsRequire() && !this.data.btnLoading) {
      this.setData({
        btnLoading: true
      })
      this.saveCurrentItem(
        () => {
          if (this.data.currentObject.index + 1 < this.data.checkList.length) {
            this.itemClickFunc(this.data.checkList[this.data.currentObject.index + 1], this.data.currentObject.index + 1)
            this.tabGoBack()
          } else {
            this.setData({
              dialogShow: false
            })
          }
        }
      )
    }
  },
  // 检查下一条
  previewNext() {
    if(this.data.abnormalonly) {
      if(this.data.abnormalArr.length) {
        this.itemClickFunc(this.data.checkList[this.data.abnormalArr[this.data.abnormalIndex]], this.data.abnormalArr[this.data.abnormalIndex], this.data.abnormalIndex)
      } else {
        wx.showToast({
          title: '没找到异常项',
        })
        return 
      }
    } else {
      if (this.data.currentObject.index + 1 < this.data.checkList.length) {
        this.itemClickFunc(this.data.checkList[this.data.currentObject.index + 1], this.data.currentObject.index + 1)
      }
    }
  },
  // 保存当前的一条检查条目
  saveCurrentItem(func) {
    const obj = this.data.checkList[this.data.currentObject.index]
    let that = this
    if(this.data.canHandle) {
      wx.getLocation({
        type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
        success(res) {
          const latitude = res.latitude;
          const longitude = res.longitude;
          API.reportOneCheckList({
            "id": obj.id,
            "items": [{
              "id": obj.id,
              "itemStatus": obj.itemStatus,
              "itemStatusName": obj.itemStatusName,
              "patrolValue": obj.patrolValue,
              "picUrls": obj.picUrls,
              "remark": obj.remark,
              "taskObjectId": obj.taskObjectId || ''
            }],
            "patrolCategory": 2,
            "patrolValue": obj.patrolValue,
            "picUrls": obj.picUrls,
            longitude,
            latitude,
            "remark": obj.remark
          }).then(res => {
            wx.setStorage({
              key: 'feedbackSuccess',
              data: 'feedbackSuccess'
            })
            that.setData({
              btnLoading: false
            })
            if (func) {
              func()
            }
          }).catch(() => {
            that.setData({
              btnLoading: false
            })
          })
        },
        fail(err) {
          that.setData({
            btnLoading: false
          })
          wx.showToast({
            title: '无法获取经纬度，不能进行巡查处置',
          })
        }
      });
    } else {
      wx.showToast({
        title: '当前用户无审核权限',
        icon: 'none'
      })
    }

  },
  // 当描述信息被改变的时候
  onTextFieldChange(e) {
    const {
      index
    } = this.data.currentObject
    let arr = this.data.checkList
    arr[index].remark = e.detail
    this.setData({
      currentObject: {
        ...this.data.currentObject,
        remark: e.detail
      },
      checkList: arr
    })
  },
  onAuditTextFieldChange(e) {
    this.setData({
      message: e.detail
    })
  },
  // 设置当前值的文件和备注是否必填，当为必填时校验为空提示错误不保存，不进行下一步
  currentIsRequire() {
    const {
      index
    } = this.data.currentObject
    if (this.data.checkList[index].patrolValue) {
      const tempArr = JSON.parse(this.data.currentObject.itemValue)
      let aimObj = tempArr.find(item => item.value === this.data.checkList[index].patrolValue)
      if (aimObj.reportAttachment) {
        // 如果为true，则要求必填
        if (!this.data.checkList[index].remark) {
          wx.showToast({
            title: '请填写描述信息',
            icon: 'none'
          })
          return false
        }
        if (!this.data.checkList[index].picUrls || this.data.checkList[index].picUrls.length <= 0) {
          wx.showToast({
            title: '请上传至少一张图片',
            icon: 'none'
          })
          return false
        }
      } else {
        // 可以不用校验
        return true
      }
    }
    return true
  },
  validateItems() {
    let checkListTemp = this.data.checkList
    checkListTemp.forEach(one => {
      var tempArr = JSON.parse(one.itemValue);
      var aimObj = tempArr.find(function (item) {
        return item.value === one.patrolValue;
      });
      one.reportAttachment = aimObj.reportAttachment || false
    });
    return checkListTemp.every((item) => {
      // 如果 reportAttachment 是 true，则需要进一步验证 picUrls 和 remark
      if (item.reportAttachment === true) {
        if (!(Array.isArray(item.picUrls) && item.picUrls.length > 0)) {
          wx.showToast({
            title: `请上传清单${item.itemName}的相关图片`,
            icon: 'none'
          })
        }
        if (!(item.remark != null && item.remark !== '')) {
          wx.showToast({
            title: `请填写清单${item.itemName}的描述信息`,
            icon: 'none'
          })
        }
        // 检查 picUrls 是否是一个非空数组以及 remark 是否有值
        return Array.isArray(item.picUrls) && item.picUrls.length > 0 &&
          item.remark != null && item.remark !== '';
      }
      // 对于 reportAttachment 不是 true 的情况，直接返回 true
      return true;
    });
  },
  // 单个图片预览
  previewSingleImg(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.url, // 当前显示图片的链接  
      urls: [event.currentTarget.dataset.url] // 需要预览的图片链接列表  
    })
  }
})