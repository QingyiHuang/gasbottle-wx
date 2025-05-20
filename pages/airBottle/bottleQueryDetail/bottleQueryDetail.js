const API = require('@/utils/gasApi')
import { formatTime } from '@/utils/util'
Page({
  data: {
    detailInfo: [],
    mainInfo: {}
  },
  onLoad(options) {
    if(options.barCode) {
      this.queryBottleDetail(options.barCode)
    }
  },
  queryBottleDetail(barCode) {
    API.gasBottleQueryById({
      barCode: barCode 
    }).then(res => {
      if (res.scrapDate) {
        res.scrapDate = formatTime(res.scrapDate)
      }
      if (res.localExamineTime) {
        res.localExamineTime = formatTime(res.localExamineTime)
      }
      if (res.examineTime) {
        res.examineTime = formatTime(res.examineTime)
      }
      let detailInfo = [{
        name: '气瓶条码',
        value: res.barCode || '--'
      },{
        name: '制造单位',
        value: res.factoryUnit || '--'
      },{
        name: '出厂编号',
        value: res.factoryNumber ||'--'
      },{
        name: '制造年月',
        value: res.manufactureTime || '--'
      },{
        name: '检验有效期至',
        value: res.examineTime || '--'
      },{
        name: '气瓶种类',
        value: res.bottleTypeName || '--'
      },{
        name: '检验单位',
        value: res.testUnit || '--'
      },{
        name: '服务电话',
        value: res.phone || '--'
      },{
        name: '登记单位',
        value: res.registrationUnit || '--'
      },{
        name: '瓶气总重(kg)',
        value: res.weight || '--'
      },{
        name: '充装介质',
        value: res.medium || '--'
      }]
      this.setData({
        detailInfo: detailInfo,
        mainInfo: res
      })
    })
  }
})