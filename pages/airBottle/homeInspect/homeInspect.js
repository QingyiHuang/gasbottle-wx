const API = require('@/utils/gasApi')
import Dialog from '@vant/weapp/dialog/dialog';
Page({
  data: {
    phoneErrorMsg: '',
    phoneNo: '',
    username: '',
    userId: '',
    checked: false,
    checkList: [],
    currentBottleDialogShow: false,
    bottleList: [],
    showAll: false,
    // 弹框部分
    currentObject: {},
    dialogShow: false,
    dialogShow2: false,
    statu: 1, // 选择单项正常异常
    tabActive: 1, // 切换弹框的界面1或转到界面2
    fileList: [], // 文件列表
    abnormalonly: false, // 只查看异常项
    abnormalArr: [], // 异常数据的下标
    abnormalIndex: 0,
    message: '',
    addressInfo: {
      longitude: '',
      latitude: '',
      address: ''
    },
    showMap: false
  },
  onLoad(options) {
    this.setBottleListInfo()
    this.queryHomeInspectItem()
  },
  // 完成签收
  finishedSign() {
    // 校验每一项是否都是该填的填完了，填完了就完成
    if (this.validatePhoneAndName() && this.validateItems() && this.validateCheck()) {
      Dialog.confirm({
          title: '是否确认完成巡查？',
        })
        .then(() => {
          if(this.data.showMap) {
            API.gasUserAdd({
              "address": this.data.addressInfo.address,
              "latitude": this.data.addressInfo.latitude,
              "longitude": this.data.addressInfo.longitude,
              "name": this.data.username,
              "phone": this.data.phoneNo
            }).then(res => {
              // 添加完成后查询用户id
              API.gasUserDetailByPhone({
                phoneNo: this.data.phoneNo
              }).then(res => {
                if (res && res.length) {
                  this.setData({
                    userId: res[0].id
                  })
                  this.singnFunc()
                }
              })
            })
          } else {
            this.singnFunc()
          }
        })
    }
  },
  // 签收的方法
  singnFunc() {
    let that = this
    let inspectItemsArr = []
    this.data.checkList.forEach(item => {
      inspectItemsArr.push({
        "abnormal": item.reportAttachment,
        "itemId": item.id,
        "pictureUrls": item.picUrls || [],
        "remark": item.remark,
        "status": item.itemStatus,
        "statusName": item.patrolValue
      })
    })
    API.staffHomeInspect({
      "gasUserId": this.data.userId,
      "inspectItems": inspectItemsArr
    }).then(res => {
      if(res) {
        let bottleIds = []
        this.data.bottleList.forEach(item =>{
          bottleIds.push(item.bottleId)
        })
        API.staffArrive({
          "bottleIds": bottleIds,
          "gasUserId": this.data.userId,
          "inspectId": res
        }).then(res2 => {
          wx.showToast({
            title: '签收成功',
            icon: 'success'
          })
          wx.removeStorage({
            key: 'signCheckList',
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 2
            })
          }, 1000)
        })
      }
    })
  },
  queryHomeInspectItem() {
    API.homeInspectItemList({}).then(res => {
      if (res && res.length) {
        this.setData({
          checkList: res
        })
      }
    })
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
    } else {
      // 将当前对象和 checklist当前picUrls 设置为空
      this.setData({
        currentObject: {
          ...value,
          picUrls: []
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
      if (this.data.abnormalonly) {
        if (abnormalIndex + 1 < this.data.abnormalArr.length) {
          this.setData({
            abnormalIndex: this.data.abnormalIndex + 1
          })
        }
      }
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
    });
  },
  onClose1() {
    // // 第一个关闭时自动保存当前状态
    // this.saveCurrentItem()
    this.setData({
      dialogShow: false
    })
  },
  onClose() {
    this.setData({
      dialogShow: false,
      dialogShow2: false,
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
      name: 'file',
      formData: {
        openId: wx.openId
      },
    }).then(res => {
      if (res) {
        let arr = [{
          url: res,
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
    const {
      index
    } = e.detail;
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
    if (this.data.abnormalonly) {
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
    this.setData({
      abnormalArr: indices,
      abnormalIndex: 0
    }, () => {
      this.previewNext()
    })
  },
  // 切换下一条检查
  checkNext() {
    if (this.currentIsRequire()) {
      if (this.data.currentObject.index + 1 < this.data.checkList.length) {
        this.itemClickFunc(this.data.checkList[this.data.currentObject.index + 1], this.data.currentObject.index + 1)
        this.tabGoBack()
      } else {
        this.setData({
          dialogShow: false
        })
      }
    }
  },
  // 检查下一条
  previewNext() {
    if (this.data.abnormalonly) {
      this.itemClickFunc(this.data.checkList[this.data.abnormalArr[this.data.abnormalIndex]], this.data.abnormalArr[this.data.abnormalIndex], this.data.abnormalIndex)
    } else {
      if (this.data.currentObject.index + 1 < this.data.checkList.length) {
        this.itemClickFunc(this.data.checkList[this.data.currentObject.index + 1], this.data.currentObject.index + 1)
      }
    }
  },
  // 保存当前的一条检查条目
  saveCurrentItem(func) {
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
    let goonflag = true
    checkListTemp.forEach(one => {
      console.log(one.patrolValue)
      if(!one.patrolValue) {
        goonflag = false
        return;
      }
      var tempArr = JSON.parse(one.itemValue);
      var aimObj = tempArr.find(function (item) {
        return item.value === one.patrolValue;
      });
      one.reportAttachment = aimObj.reportAttachment || false
    });
    if(!goonflag) {
      wx.showToast({
        title: '您还有未检查的项目',
        icon: 'none'
      })
      return false
    }
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
  validateCheck() {
    return this.data.checked
  },
  // 判断电话号码和姓名是否有值
  validatePhoneAndName() {
    if (!this.data.phoneNo && !this.validatePhoneNumber(this.data.phoneNo)) {
      wx.showToast({
        title: '请输入正确手机号码',
        icon: 'none'
      })
      return false
    }
    if (!this.data.username) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return false
    }
    if(this.data.showMap && !this.data.addressInfo.address) {
      wx.showToast({
        title: '请选择用气户地址',
        icon: 'none'
      })
      return false
    }
    return true
  },
  onPhoneNoChange(e) {
    this.setData({
      phoneNo: e.detail
    })
  },
  onUsernameChange(e) {
    this.setData({
      username:e.detail
    })
  },
  phoneNoBlur() {
    this.setData({
      phoneErrorMsg: ''
    })
    if (this.validatePhoneNumber(this.data.phoneNo)) {
      API.gasUserDetailByPhone({
        phoneNo: this.data.phoneNo
      }).then(res => {
        if (res && res.length) {
          this.setData({
            showMap: false,
            addressInfo: {},
            username: res[0].name,
            userId: res[0].id
          })
        } else {
          // 需要添加用户
          this.setData({
            showMap: true
          })
        }
      })
    } else {
      this.setData({
        phoneErrorMsg: '电话号码输入有误'
      })
    }
  },
  // 手机号码校验
  validatePhoneNumber(phoneNumber) {
    const mobilePattern = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|17[0|1|3|5|6|7|8]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
    const landlinePattern = /^($\d{3}$|\d{3}-)?\d{8}$/;
    return mobilePattern.test(phoneNumber) || landlinePattern.test(phoneNumber);
  },
  onChange(event) {
    this.setData({
      checked: event.detail,
    });
  },
  goBack() {
    wx.navigateBack()
  },
  // 从上个页面带回来的气瓶信息
  setBottleListInfo() {
    wx.getStorage({
      key: 'signCheckList',
      success: (res) => {
        const items = res.data
        this.setData({
          bottleList: items
        })
      }
    })
  },
  // 展示当前的气瓶
  showCurrentBottle() {
    this.setData({
      currentBottleDialogShow: true
    })
  },
  displayCard() {
    this.setData({
      showAll: !this.data.showAll
    })
  },
  // 弹框关闭
  onClose() {
    this.setData({
      currentBottleDialogShow: false
    })
  },
  // 检查结果描述
  tabCheckDetail() {
    this.setData({
      tabActive: 2
    })
  },
  chooseAddress() {
    wx.chooseLocation({
      longitude: this.data.addressInfo.longitude,
      latitude: this.data.addressInfo.latitude,
      success: (res =>{
        if(res.address) {
          this.setData({
            addressInfo: {
              longitude: res.longitude,
              latitude: res.latitude,
              address: res.name || res.address
            }
          })
        }
      })
    })
  },
  deleteOneGas(e) {
    const {index} = e.currentTarget.dataset
    if(this.data.bottleList.length <= 1) {
      wx.showToast({
        title: '送达操作至少要保留一个气瓶',
        icon: 'none'
      })
      return false
    }
    if (index !== undefined && this.data.bottleList.length > index) {
      const updatedGasList = [...this.data.bottleList];
      updatedGasList.splice(index, 1);
      this.setData({
        bottleList: updatedGasList
      });
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }
    wx.setStorage({
      key: 'signCheckList',
      data: this.data.bottleList
    })
  }
})