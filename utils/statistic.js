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
  // 查询人员首页统计
  homepageStatistic (params) {
    return http.get({
      url: '/app/gasBottle/homePage/bottleCount',
      data: params
    })
  }
}