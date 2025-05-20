const { wxGet, wxPost, wxUpload } = require('@/utils/util')
const getUrl = (url) => {
  return 'https://test.com/citycasehandle-abis' + url + (url.includes('.do') ? '' : '.do')
}
const getUrlNoDot = (url) => {
  return 'https://test.com/citycasehandle-abis' + url
}
const http = {
  post(params, noNeedDot = false) {
    let url = ''
    if (noNeedDot) {
      url = getUrlNoDot(params.url)
    } else {
      url = getUrl(params.url)
    }
    return wxPost(url, params.data)
  },
  get(params) {
    const url = getUrl(params.url)
    return wxGet(url, params.data)
  },
  upload(params) {
    const url = getUrl(params.url)
    return wxUpload(url, params.data.filePath, params.data.name, params.data.formData)
  },
}
module.exports = {
  // /citycasehandle-abis/app/gasBottle/page.do 分页查询气瓶信息
  gasBottlePage (params) {
    return http.post({
      url: '/app/gasBottle/page',
      data: params
    })
  },
  // /citycasehandle-abis/app/gasBottle/queryById.do 根据条形码查询气瓶信息
  gasBottleQueryById (params) {
    return http.get({
      url: '/app/gasBottle/queryById',
      data: params
    })
  },
  // /citycasehandle-abis/app/gasBottle/status/dist.do 获取气瓶状态类型型字典
  gasBottleStatusDist (params) {
    return http.get({
      url: '/app/gasBottle/status/dist',
      data: params
    })
  },
  // /citycasehandle-abis/app/gasBottle/traffic/dist.do 获取气瓶状态类型型字典
  gasBottleTrafficDist (params) {
    return http.get({
      url: '/app/gasBottle/traffic/dist',
      data: params
    })
  },
  // /citycasehandle-abis/app/gasBottle/type/dist.do 获取气瓶类型字典
  gasBottleTypeDist (params) {
    return http.get({
      url: '/app/gasBottle/type/dist',
      data: params
    })
  },
  // /citycasehandle-abis/app/getAllCameras.do 获取全部监控点
  getAllCameras (params) {
    return http.post({
      url: '/app/getAllCameras',
      data: params
    })
  },
  // /citycasehandle-abis/app/getPreviewParamHtml5.do 获取播放url
  getPreviewParamHtml5 (params) {
    return http.post({
      url: '/app/getPreviewParamHtml5',
      data: params
    })
  },
  // /citycasehandle-abis/wx/oauth/oauth2/accessToken 获取基础支持access_token
  oauth2AccessToken (params) {
    return http.post({
      url: '/wx/oauth/oauth2/accessToken',
      data: params
    }, true)
  },
  // /citycasehandle-abis/wx/oauth/oauth2/login4OpenId 小程序登录, 获取用户唯一id(openid)
  oauth2Login4OpenId (params) {
    return http.post({
      url: '/wx/oauth/oauth2/login4OpenId?code=' + params.code,
      data: params
    }, true)
  },
  // /citycasehandle-abis/wx/oauth/user/bind 用户手机号在平台绑定
  userBind (params) {
    return http.post({
      url: '/wx/oauth/user/bind',
      data: params
    }, true)
  },
  // 获取稳定版本acctk/citycasehandle-abis/wx/oauth/oauth2/stableToken
  oauth2StableToken (params) {
    return http.post({
      url: '/wx/oauth/oauth2/stableToken',
      data: params
    }, true)
  },
  // 获取用户电话号码/citycasehandle-abis​/wx​/oauth​/oauth2​/userPhoneNo
  oauth2UserPhoneNo (params) {
    return http.post({
      url: '/wx/oauth/oauth2/userPhoneNo',
      data: params
    }, true)
  },
  // 气瓶运输流转
  // 销售点一键入库/citycasehandle-abis/app/gasBottle/traffic/salesPoint/store.do
  salesPointStore (params) {
    return http.post({
      url: '/app/gasBottle/traffic/salesPoint/store',
      data: params
    })
  },
  // ​ /citycasehandle-abis​/app​/gasBottle​/traffic​/salesPoint​/storeCancel.do 销售点撤销入库
  salesPointStoreCancel (params) {
    return http.post({
      url: '/app/gasBottle/traffic/salesPoint/storeCancel',
      data: params
    })
  },
  // /citycasehandle-abis/app/gasBottle/traffic/staff/arrive.do 送气工扫码送达
  staffArrive (params) {
    return http.post({
      url: '/app/gasBottle/traffic/staff/arrive',
      data: params
    })
  },
  // /citycasehandle-abis/app/gasBottle/traffic/staff/delivery.do 送气工扫码出库
  staffDelivery (params) {
    return http.post({
      url: '/app/gasBottle/traffic/staff/delivery',
      data: params
    })
  },
  // /citycasehandle-abis/app/gasBottle/traffic/staff/deliveryCancel.do 送气工撤销出库
  staffDeliveryCancel (params) {
    return http.post({
      url: '/app/gasBottle/traffic/staff/deliveryCancel',
      data: params
    })
  },
  // /citycasehandle-abis/app/gasBottle/traffic/staff/homeInspect.do 入户检查信息提交
  staffHomeInspect (params) {
    return http.post({
      url: '/app/gasBottle/traffic/staff/homeInspect',
      data: params
    })
  },
  // /app/gasBottle/registrationUnit/list.do 获取登记单位列表
  registrationUnitList (params) {
    return http.get({
      url: '/app/gasBottle/registrationUnit/list',
      data: params
    })
  },
  // 根据电话号码查询用户信息/citycasehandle-abis/app/gasBottle/traffic/gasUser/detailByPhone.do
  gasUserDetailByPhone (params) {
    return http.get({
      url: '/app/gasBottle/traffic/gasUser/detailByPhone',
      data: params
    })
  },
  // 分页查询入户检查项目配置/citycasehandle-abis/app/gasBottle/homeInspect/item/list.do
  homeInspectItemList (params) {
    return http.post({
      url: '/app/gasBottle/homeInspect/item/list',
      data: params
    })
  },
  // /citycasehandle-abis/app/gasBottle/traffic/staff/homeInspect.do 保存入户信息检查
  staffHomeInspect (params) {
    return http.post({
      url: '/app/gasBottle/traffic/staff/homeInspect',
      data: params
    })
  },
  // 上传图片/citycasehandle-abis/app/gasBottle/traffic/uploadPic.do
  uploadPics (params) {
    return http.upload({
      url: '/app/gasBottle/traffic/uploadPic',
      data: params
    })
  },
  // 新增用户信息/citycasehandle-abis/app/gasBottle/traffic/gasUser/add.do
  gasUserAdd (params) {
    return http.post({
      url: '/app/gasBottle/traffic/gasUser/add',
      data: params
    })
  },
  // /wx/oauth/user/postList
  userPostList (params) {
    return http.post({
      url: '/wx/oauth/user/postList',
      data: params
    }, true)
  },
  // 查询人员首页统计
  homepageStatistic (params) {
    return http.get({
      url: '​/app​/gasBottle​/homePage​/bottleCount',
      data: params
    })
  }
}