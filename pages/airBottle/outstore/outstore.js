const API = require('@/utils/gasApi')
Page({
  data: {
    scanPlaceHolder: '对准气瓶二维码进行识别',
    dialogShow: true,
    showAll: false,
    gasList: [],
    lastExecuteTime: 0, // 节流用，处理安卓ios之间扫码频率不同导致现象不同问题
    THROTTLE_DELAY: 500 // 节流时间间隔
  },
  // 从url中截取气瓶编号
  getIdFromUrlOrNumber(input) {
    // 正则表达式用于匹配：
    // 1. URL路径中的最后一个数字序列
    // 2. 纯数字字符串
    // 3. URL查询参数中的数字（如 ?d=7301955047）
    // 4. URL中最后一个等号后的数据（如 qpcode=7302960085）
    const pattern = /(?:\/(\d+))[^\/]*$|^(?=\d+$)(\d+)$|(?:\?[^=]*=(\d+))$|(?:[^=]*=(\d+))$/;
    let match = input.match(pattern);
    if (match) {
      // 如果匹配成功，返回第一个捕获组（斜杠后的数字）或第二个捕获组（纯数字）或第三个捕获组（查询参数中的数字）或第四个捕获组（最后一个等号后的数字）
      return match[1] || match[2] || match[3] || match[4];
    } else {
      console.error('Invalid input:', input);
      return null;
    }
  },
  testAdd() {
    wx.scanCode({
      onlyFromCamera: false, // 是否只能从相机扫码，默认false，允许从相册选择图片
      scanType: ['qrCode'],
      success: async (res) => {
        let result2 = this.getIdFromUrlOrNumber(res.result)
        let obj = await this.getBottleIdByBarCode(result2)
        if (obj) {
          if (obj.trafficStatus !== 1 && obj.trafficStatus !== 0) {
            wx.showToast({
              title: '该气瓶不可出库操作',
              icon: 'none'
            });
          } else {
            this.setData({
              gasList: [{
                bottleNo: result2,
                bottleId: obj.id,
                trafficStatus: obj.trafficStatus
              }, ...this.data.gasList]
            });
            wx.showToast({
              title: '气瓶扫码成功',
              icon: 'success'
            });
          }
        } else {
          wx.showToast({
            title: '未注册编码',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '扫描失败，请重试',
          icon: 'none'
        });
      }
    });
  },
  async onScanCode(e) {
    const now = Date.now()
    if (now - this.data.lastExecuteTime < this.data.THROTTLE_DELAY) {
      return
    } else {
      this.setData({
        lastExecuteTime: now
      })
      const {
        result,
        type
      } = e.detail;
      let result2 = this.getIdFromUrlOrNumber(result)
      if (result2) {
        // 检查是否已经存在该二维码记录
        const isExist = this.data.gasList.some(item => item.bottleNo === result2);
        if (isExist) {
          wx.showToast({
            title: '此气瓶已扫描过',
            icon: 'none'
          });
        } else {
          let obj = await this.getBottleIdByBarCode(result2)
          if (obj) {
            if (obj.trafficStatus !== 1 && obj.trafficStatus !== 0) {
              wx.showToast({
                title: '该气瓶不可出库操作',
                icon: 'none'
              });
            } else {
              this.setData({
                gasList: [{
                  bottleNo: result2,
                  bottleId: obj.id,
                  trafficStatus: obj.trafficStatus
                }, ...this.data.gasList]
              });
              wx.showToast({
                title: '气瓶扫码成功',
                icon: 'success'
              });
            }
          } else {
            wx.showToast({
              title: '未注册编码',
              icon: 'none'
            });
          }
        }
      } else {
        wx.showToast({
          title: '您扫描的并不是气瓶二维码',
          icon: 'none'
        });
      }
    }
  },
  // 处理扫码后获得的barCode，用这个barCode
  async getBottleIdByBarCode(barCode) {
    let res = await API.gasBottleQueryById({
      barCode
    })
    // 气瓶不等于出库运输状态的时候都能扫
    if (res && res.id) {
      return {
        id: res.id,
        trafficStatus: res.trafficStatus
      }
    } else {
      return false
    }
  },
  deleteOneGas(e) {
    const {
      index
    } = e.currentTarget.dataset
    if (index !== undefined && this.data.gasList.length > index) {
      const updatedGasList = [...this.data.gasList];
      updatedGasList.splice(index, 1);
      this.setData({
        gasList: updatedGasList
      });
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }
  },
  error(e) {
    console.error('Camera component encountered an error:', e.detail);
  },
  toggleScanner() {
    // 切换逻辑，例如关闭相机或跳转到其他页面
  },
  async canceloutstore() {
    let bottleIds = []
    this.data.gasList.map(item => {
      if (item.trafficStatus === 1) {
        bottleIds.push(item.bottleId)
      }
    })
    if (bottleIds && bottleIds.length) {
      API.staffDeliveryCancel({
        bottleIds
      }).then(res => {
        if (res) {
          const list = this.data.gasList.map(item => {
            return {
              ...item,
              trafficStatus: 0
            }
          })
          this.setData({
            gasList: list
          })
        }
      })
    }
  },
  outstoreBatch() {
    // 从气瓶列表中的到bottleId数组
    let bottleIds = []
    this.data.gasList.map(item => {
      if (item.trafficStatus === 0) {
        bottleIds.push(item.bottleId)
      }
    })
    if (bottleIds && bottleIds.length) {
      API.staffDelivery({
        bottleIds
      }).then(res => {
        if (res) {
          const list = this.data.gasList.map(item => {
            return {
              ...item,
              trafficStatus: 1
            }
          })
          this.setData({
            gasList: list
          })
        }
      })
    }
  },
  displayCard() {
    this.setData({
      showAll: !this.data.showAll
    })
  },
})