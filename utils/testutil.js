const formatTime = val => {
  const date = new Date(val)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
const wxPost = (url, data) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中...',
    })
    setTimeout(() => {
      wx.hideLoading()
    }, 1000)
    wx.request({
      url,
      header: {
        wxOpenId: getKey('openId')
      },
      data: {
        openId: getKey('openId'),
        ...data

      },
      method: 'POST',
      success(res) {
        wx.hideLoading();
        if (res.data.code === '0') {
          resolve(res.data.data)
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'error',
            duration: 2000
          })
          reject(res)
        }
      },
      fail(err) {
        wx.hideLoading();
        wx.showToast({
          title: '系统错误请提示管理员',
          icon: 'error',
          duration: 2000
        })
      }
    })
  })
}
const wxGet = (url, data) => {
  wx.showLoading({
    title: '加载中...',
  })
  setTimeout(() => {
    wx.hideLoading()
  }, 1000)
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      header: {
        wxOpenId: getKey('openId')
      },
      data: {
        openId: getKey('openId'),
        ...data
      },
      method: 'GET',
      success(res) {
        wx.hideLoading();
        if (res.data.code === '0') {
          resolve(res.data.data)
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'error',
            duration: 2000
          })
          reject(res)

        }
      },
      fail(err) {
        wx.hideLoading();
        wx.showToast({
          title: '系统错误请提示管理员',
          icon: 'error',
          duration: 2000
        })
      }
    })
  })
}
const wxUpload = (url, filePath, name, formData) => {
  wx.showLoading({
    title: '加载中...',
  })
  setTimeout(() => {
    wx.hideLoading()
  }, 1000)
  return new Promise((resolve, reject) => {
    return wx.uploadFile({
      filePath: filePath,
      header: {
        wxOpenId: getKey('openId')
      },
      name: name,
      url: url,
      formData: formData,
      success(res) {
        wx.hideLoading();
        if (res.data) {
          var obj = JSON.parse(res.data)
          resolve(obj.data)
        } else {
          wx.showToast({
            title: '图片上传错误',
            icon: 'error',
            duration: 2000
          })
          reject(res)
        }
      },
      fail(res) {
        wx.hideLoading();
        wx.showToast({
          title: '图片上传错误',
          icon: 'error',
          duration: 2000
        })
        reject(res)
      }
    })
  })
}
const getKey = (key) => {
  return 'o5-Xu63W1YL7VlS7Ld5XzP8Vxz7g'
  
  // return 'o5-Xu69LUvfI-CATUN8_-XD6YcGE'
  // return 'o5-Xu61DsZspuc7oo6E9-z1zpWZs'
  // return 'o5-Xu6xKj5isuX3YlGZa_z_3YZcQ'
  // return 'o5-Xu6_FWMI5wRrk1UQ34l-bzAm0'
  // return 'o5-Xu65Jn6aYPd6igd4qCzpYd63w'
  // return 'o5-Xu6wjSnMAeoU4_tOK89-SIVrQ'
}
module.exports = {
  formatTime,
  wxGet,
  wxPost,
  wxUpload
}