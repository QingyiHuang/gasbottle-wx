const { wxGet, wxPost, wxUpload } = require('@/utils/util')
const getUrl = (url) => {
  return 'https://test.com/citycasehandle-abis' + url + (url.includes('.do') ? '' : '.do')
}
const http = {
  post(params) {
    const url = getUrl(params.url)
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
  }
}