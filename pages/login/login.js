const API = require('@/utils/gasApi.js')
Page({
  data: {
    errorP: '',
    openId: ''
  },
  onLoad(options) {
    this.setData({
      errorP: ''
    })
    wx.login({
      success: (res1) => {
        if(res1.code) {
          API.oauth2Login4OpenId({
            code: res1.code
          }).then(res2 =>{
            // 获取openId sessionKey
            let openId = res2.openId
            wx.openId = openId
            if (res2.bindPhone) {
              // this.getMenuPow()
              wx.redirectTo({
                url: '/pages/index/index'
              })
            }
          })
        }
      } 
    })
  },
  getPhoneNumber(e) {
    this.setData({
      errorP: ''
    })
    const that = this;
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      wx.login({
        success: (res1) => {
          if(res1.code) {
            API.oauth2Login4OpenId({
              code: res1.code
            }).then(res2 =>{
              // 获取openId sessionKey
              let openId = res2.openId
              wx.openId = openId
              if (res2.bindPhone) {
                wx.redirectTo({
                  url: '/pages/index/index'
                })
              } else {
                API.oauth2UserPhoneNo({
                  "code": e.detail.code
                }).then(res3 =>{
                  if (res3 && res3.phoneNumber) {
                    const phone = res3.phoneNumber
                    wx.phoneNumber = res3.phoneNumber
                    // 将phone 与 openid进行绑定
                    API.userBind({
                      "openId": openId,
                      "phoneNo": phone
                    }).then(res => {
                      if(res) {
                        wx.redirectTo({
                          url: '/pages/index/index'
                        })
                      }
                    }).catch(err => {
                      this.setData({
                        errorP: err.data.msg
                      })
                    })
                  } else {
                    wx.showToast({
                      title: '未获取到手机号，暂时无法使用',
                      icon: 'none'
                    })
                  }
                })
              }
            })
          }
        } 
      })
    } else {
      // 用户拒绝授权
      wx.showToast({
        title: '您拒绝了手机号授权,暂时无法使用小程序',
        icon: 'none'
      });
    }
  }
})