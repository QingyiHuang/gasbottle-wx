const { wxGet, wxPost, wxUpload } = require('@/utils/util')
const getUrl = (url) => {
  return 'https://test.com/citycasehandle-ptl' + url + (url.includes('.do') ? '' : '.do')
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
  // 巡查审核任务
  auditTask (params) {
    return http.post({
      url: '/wx/patrolReport/auditTask',
      data: params
    })
  },
  // 校验是否有审核权限
  checkAuditAbility (params) {
    return http.post({
      url: '/wx/patrolReport/checkAuditAbility',
      data: params
    })
  },
  // 完成巡查任务
  completeTask (params) {
    return http.post({
      url: '/wx/patrolReport/completeTask',
      data: params
    })
  },
  // 查询字典列表
  queryDicts (params) {
    return http.post({
      url: '/wx/patrolReport/queryDicts.do?type=' + params.type,
      data: params,
    })
  },
  // 分页查询巡查任务
  queryTaskByPage (params) {
    return http.post({
      url: '/wx/patrolReport/queryTaskByPage',
      data: params
    })
  },
  // 上报巡查结果
  reportOneCheckList (params) {
    return http.post({
      url: '/wx/patrolReport/report',
      data: params
    })
  },
  // 批量上传巡查图片
  uploadPics (params) {
    return http.upload({
      url: '/wx/patrolReport/uploadPics',
      data: params
    })
  },
  // 检查是否有上报权限/wx/patrolReport/checkReportAbility.do
  checkReportAbility (params) {
    return http.get({
      url: '/wx/patrolReport/checkReportAbility',
      data: params
    })
  },
  // ​/citycasehandle-ptl​/wx​/patrolReport​/queryTaskOverview.do查询任务概览
  queryTaskOverview (params) {
    return http.get({
      url: '/wx/patrolReport/queryTaskOverview',
      data: params
    })
  },
  // /citycasehandle-ptl/wx/patrolReport/queryTaskByPage.do
}