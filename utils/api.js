const { wxGet, wxPost, wxUpload } = require('@/utils/util')
const getUrl = (url) => {
  return 'https://test.com/citycasehandle' + url + (url.includes('.do') ? '' : '.do')
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

module.exports =  {
  // 上传文件
  reportFiles (data) {
    return http.upload({ url: '/wx/case/file/upload', data })
  },
//   /citycasehandle/wx/case/batch/collectCase.do 批量督办
  batchCollectCase (params) {
    return http.post({
      url: '/wx/case/batch/collectCase',
      data: params
    })
  },
  // 批量催办/citycasehandle/wx/case/batch/urgeCase.do
  batchUrgeCase (params) {
    return http.post({
      url: '/wx/case/batch/urgeCase',
      data: params
    })
  },
  // 处置问题接口
  dealCase (params) {
    return http.post({
      url: '/wx/case/handle',
      data: params
    })
  },
  // /citycasehandle​/wx​/case​/list.do 问题检索
  caseQueryList(params = {}) {
    return http.post({
      url: '/wx/case/list',
      data: params
    })
  },
  // 查询问题处置操作
  queryCaseOperate (params = {}) {
    return http.post({
      url: '/wx/case/process/instance/info',
      data: params
    })
  },
  // 查询问题详情
  queryDetailById (params = {}) {
    return http.post({
      url: '/wx/case/detail/info',
      data: params
    })
  },
  // 查询高德地图key
  gdMapServiceKey (params = {}) {
    return http.post({
      url: '/app/common/systemConfig/gdMapServiceKey/query',
      data: params
    })
  },
  // 获取网格管理用户组织树
  queryUsers (params = {}) {
    return http.post({
      url: '/wx/case/gdsc/assign/depts',
      data: params
    })
  },
  // 查询关联问题
  queryRelativeCases (caseNo) {
    return http.post({
      url: '/wx/case/caseAlarm/list.do?caseNo=' + caseNo
    })
  },
  // 查询待办
  queryTodoList (params = {}) {
    return http.post({
      url: '/wx/case/todoList',
      data: params
    })
  },
  // 查询经办
  queryHandleHistory (params = {}) {
    return http.post({
      url: '/wx/case/handledList',
      data: params
    })
  },
  // 查询办理经过
  queryProcessList (params = {}) {
    return http.post({
      url: '/wx/case/processList',
      data: params
    })
  },
  // 判断当前用户是否为领导用户
  isSupervisor () {
    return http.post({
      url: '/wx/case/user/isSupervisor'
    })
  },
  // 普通用户问题统计-总览及详情
  overviewUserCase (params) {
    return http.post({
      url: '/wx/case/count/overviewUserCase',
      data: params
    })
  },

  // 查询督办问题
  superviseList (data) {
    return http.post({
      url: '/wx/case/supervise/list',
      data
    })
  },

  // 问题办结
  completeCase (params = {}) {
    return http.post({
      url: '/wx/case/complete',
      data: params
    })
  },
  // 实时图片
  getRealtimeCapture (params = {}) {
    return http.post({
      url: '/wx/case/capturePic',
      data: params
    })
  },
  // 问题作废
  cancelCase (params = {}) {
    return http.post({
      url: '/wx/case/cancel',
      data: params
    })
  },
  // 处置退回
  returnCase (params = {}) {
    return http.post({
      url: '/wx/case/back',
      data: params
    })
  },
  // 查询转办人/common/resource/gdsc/depts.do
  queryZhuanBanRen (params = {}) {
    return http.post({
      url: '/app/common/resource/gdsc/depts',
      data: params
    })
  },

  // 获取告警类型，包括大类和小类
  getAlarmTypes () {
    return http.post({
      url: '/wx/case/common/dictInfo/getAlarmTypes'
    })
  },

  // 获取包括告警总数的类型列表
  getAlarmTypesTotal () {
    return http.post({
      url: '/wx/case/type/total'
    })
  },
  // 获取问题状态
  getStatus (params = {}) {
    return http.post({
      url: '/wx/case/statistic/status/count',
      data: params
    })
  },
  // 获取字典的通用接口
  getDictInfo (params = {}) {
    return http.post({
      url: '/wx/case/common/dictInfo/get',
      data: params
    })
  },
  // 根据用户id查询用户操作类型
  findRoleTypeByUserId (params = {}) {
    return http.post({
      url: '/app/common/resource/findRoleTypeByUserId',
      data: params
    })
  },
  // /common/resource/community/algro/type.do
  // 获取社区算法问题类型信息
  getAlgroType () {
    return http.post({
      url: '/app/common/resource/community/algro/type'
    })
  },
  // 同步获取组织资源树
  regionInfo () {
    return http.post({
      url: '/app/common/resource/regionInfo'
    })
  },
  // 获取商铺信息
  findStore (params) {
    return http.post({
      url: '/app/common/resource/findStore',
      data: params
    })
  },
  // 添加商铺信息
  addStore (params) {
    return http.post({
      url: '/wx/common/resource/addStore',
      data: params
    })
  },
  // 获取店外违规问题信息
  findStorCaseInfo () {
    return http.post({
      url: '/app/common/resource/findStorCaseInfo'
    })
  },
  // 获取垃圾堆积问题信息
  findHeapGarbageCaseInfo () {
    return http.post({
      url: '/app/common/resource/findHeapGarbageCaseInfo'
    })
  },
  // 获取街道路面违规问题信息
  findStreetInfo () {
    return http.post({
      url: '/app/common/resource/findStreetInfo'
    })
  },
  // 查询系统初始化参数信息
  commonConfig () {
    return http.post({
      url: '/app/common/systemConfig/commonConfig/query'
    })
  },
  // 问题统计-高发违规区域
  caseRegionTop () {
    return http.post({
      url: '/wx/case/count/caseRegionTop'
    })
  },
  // 领导用户问题统计-总览及详情
  overviewAndDetails (data) {
    return http.post({
      url: '/wx/case/count/overviewAndDetails',
      data
    })
  },
  // 查询为新的MPS消息
  queryMessage (data) {
    return http.post({
      url: '/wx/case/message/query',
      data
    })
  },
  // 查询事件中心为新的MPS消息
  queryMessageCenter (data) {
    return http.post({
      url: '/wx/case/alarm/message/query',
      data
    })
  },
  // 查询流程已经配置的违规类型
  queryWorkflowProcessConfigs () {
    return http.post({
      url: '/wx/case/dealConfig/queryWorkflowProcessConfigs'
    })
  },
  // 查询本人上报的问题信息
  historyReport (params) {
    return http.post({
      url: '/wx/case/history/report',
      data: params
    })
  },
  // 根据用户id获取网格或者组织用户组织树
  deptsByUserId (params) {
    return http.post({
      url: '/wx/case/gdsc/depts',
      data: params
    })
  },
  // 问题上报
  caseReport (params) {
    return http.post({
      url: '/wx/case/report',
      data: params
    })
  },

  // 校验当前消失是否为新的
  messageisLatest (params) {
    return http.post({
      url:
        '/citycasehandle/wx/case/message/isLatest.do?caseNo=' + params.caseNo,
      data: params
    })
  },
  // 问题督办
  collectCase (data) {
    return http.post({
      url: '/wx/case/collectCase',
      data
    })
  },
  // 问题催办
  urgeCase (data) {
    return http.post({
      url: '/wx/case/urgeCase',
      data
    })
  },
  // 问题催办记录
  caseUrgeInfo (data) {
    return http.post({
      url: '/wx/case/caseUrgeInfo',
      data
    })
  },
  // 结束督办
  cancelUrgeCase (data) {
    return http.post({
      url: '/wx/case/cancelUrgeCase',
      data
    })
  },
  // 查询问题详情信息
  queryByCaseNo (params) {
    return http.post({
      url: '/wx/case/queryByCaseNo.do?caseNo=' + params.caseNo,
      data: params
    })
  },
  getSystemConfig () {
    return http.post({
      url: '/wx/common/systemConfig/commonConfig/query'
    })
  },
  // 查询问题列表事件中心
  queryCenterList (params) {
    return http.post({
      url: '/wx/case/page/query.do',
      data: params
    })
  },
  //   /citycasehandle/wx/policy/questions/detail/query.do
  questionsDetail (params) {
    return http.post({
      url: '/wx/policy/questions/detail/query',
      data: params
    })
  },
  //  /citycasehandle​/app​/wx​/policy​/questions​/page​/query.do分页查询政策要问   
  questionsPage (params) {
    return http.post({
      url: '/wx/policy/questions/page/query',
      data: params
    })
  },
  // /citycasehandle/wx/case/homePage/file/query.do 首页图片查询
  homePageFileQuery(params) {
    return http.post({
      url: '/wx/case/homePage/file/query',
      data: params
    })
  },
  // 检查项单独保存/citycasehandle/wx/case/inspect/handle.do
  inspectHandle(params) {
    return http.post({
      url: '/wx/case/inspect/handle',
      data: params
    })
  },
}