
const API = require('@/utils/api')
const utils = require('@/utils/util')
import Dialog from '@vant/weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    from: '',
    imageUrl: '../images/111222.png',
    mediaList: [],
    baseInfo: {},
    processList: [
    ],
    alarmFacePicList: [{}],
    relativeList: [{
      alarmCode: '1212121',
      caseTypName: '擅自安装超频变压器'
    }],
    actions: [],
    active: 0,
    activeName: '基本信息',
    showAction: false,
    pop1show: false,
    baseInfos: [],
    _isnotEmpty: true,
    urgeloading: false,
    urgeRecords: [{
      urgeTime: '20240414',
      urgePerson: '深化醴陵',
      urgeMsg: '快搞快搞'
    }],
    // 从问题详情获取的options操作
    options: [],
    typeDone: false,
    isSupervision: false,
    // 催办督办内容
    collected: false,
    isEnd: false,
    showDialog: false,
    inspectResults: [] // 异常项目，有异常项目和无异常项目进入不同页面
  },
  // 催办
  cuiban () {
      this.setData({
          message: '当前问题已被督办，请尽快完成处置',
          showDialog: true
      })
  },
  onDuBanChange(val) {
    this.setData({
        message: val.detail,

    })
  },
  sendContentConfirm () {
    API.urgeCase({
      caseNo: this.data.baseInfo.caseNo,
      urgeMsg: this.data.message
    }).then(() => {
        wx.showToast({
            title: '催办成功，消息已发送给处置人',
            duration: 2000
          })
        let urgeTimes = this.data.baseInfo.urgeTimes ? this.data.baseInfo.urgeTimes + 1 : 1
        this.setData({
            baseInfo: {
                ...this.data.baseInfo,
                urgeTimes,
                collected: true
            },
            collected: true
        })
        this.queryUrgeInfo()
    })
  },
//   // 督办
  duban () {
    Dialog.confirm({
        title: '督办',
        showCancelButton: true,
        confirmButtonText: '确定',
        confirmButtonColor: '#3D75F4',
        message:
          '将实时跟进问题处置状态，可在 “督办问题” 中查看全部督办问题。'
      }).then(() => {
        this.sendDuban()
      })
  },
  sendDuban () {
    API.collectCase({
      caseNo: this.data.baseInfo.caseNo
    }).then(() => {
        this.setData({
            baseInfo: {
                ...this.data.baseInfo,
                collected: true
            },
            collected: true
        })
        wx.showToast({
            title: '督办成功',
            duration: 2000
          })
    })
  },
//   // 结束督办
  endDuban () {
    Dialog.confirm({
      title: '结束督办',
      showCancelButton: true,
      confirmButtonText: '确定',
      confirmButtonColor: '#3D75F4',
      message:
        '结束督办后，问题将从 “督办问题” 中删除，且不再接收问题处置进展通知。'
    }) .then(() => {
        this.sendEndDuban()
      })
  },
  sendEndDuban () {
    API.cancelUrgeCase({
      caseNo: this.data.baseInfo.caseNo
    }).then(() => {
      wx.showToast({
        title: '结束成功',
        duration: 2000
      })

      this.setData({
        collected: false,
        baseInfo: {
            ...this.data.baseInfo,
            collected: false
        }
      })
    })
  },
// 查询催办流程）
  queryUrgeInfo() {
    API.caseUrgeInfo({
        caseNo: this.data.baseInfo.caseNo
      })
        .then((res) => {
          (res || []).forEach(item => {
            item.urgeTime = utils.formatTime(Number(item.urgeTime))
          })
          this.setData({
            urgeRecords: res || []
          })
        })
  },

  onTabChange(e) {
    this.setData({
      active: e.detail.index,
      activeName: e.detail.title
    })
  },
  onBasePopClose() {
    this.setData({
      pop1show: false
    });
  },
  onClickCell1(event) {
    const data = event.currentTarget.dataset.item;
    if (data.tag === 'case') {
      const {
        caseNo
      } = this.data.baseInfo
      API.queryRelativeCases(caseNo).then(data => {
        this.setData({
          pop1show: true,
          relativeList: data || []
        })
      })
    } else if (data.tag === 'guide') {
        this.gotolocation(this.data.baseInfo.longitude, this.data.baseInfo.latitude, this.data.baseInfo.alarmPlace)
    }

  },
  gotolocation(longitude, latitude, alarmPlace) {
    if(longitude && latitude) {
        wx.openLocation({
            latitude: Number(latitude),
            longitude: Number(longitude),
            name: alarmPlace || '目标地点',
            scale: 15, // 跳转地图页缩放比例  
            address: alarmPlace || '目标地点'
        });
    } else {
        wx.showToast({
          title: '问题未关联经纬度',
          icon: 'none'
        })
    }
  },
  onSelectAction() {

  },
  onClose() {
    this.setData({
      showAction: false
    })
  },
  //   获取基本信息从接口
  queryBasicData() {
    const data = this.data.baseInfo;
    var showPlateNo = data.plateNo && data.plateNo !== ''
    var showShop = !!data.relationShopName
    var baseArr = [{
        label: '问题编号',
        value: data.caseNo,
        rightIcon: 'link-o"',
        tag: 'case'
      },
      {
        label: '车牌号码',
        value: data.plateNo,
        isHidden: !showPlateNo
      },
      {
        label: '违规时间',
        value: data.alarmTime
      },
      {
        label: '问题描述',
        value: data.reportRemark
      },
      {
        label: '问题来源',
        value: data.reporterType
      },
      {
        label: '处置期限',
        value: data.limitTimeStr
      },
      {
        label: '所属区域',
        value: data.regionName
      },
      {
        label: '问题位置',
        value: data.alarmPlace,
        rightIcon: 'guide-o',
        tag: 'guide'
      },
      // 店铺信息
      {
        label: '店铺名称',
        value: data.relationShopName,
        isHidden: !showShop
      },
      {
        label: '店铺地址',
        value: data.relationStandardAddress,
        // rightIcon: 'guide-o',
        // tag: 'guide',
        isHidden: !showShop
      },
      {
        label: '信誉分',
        value: (data.relationShopPoint || 100) + '分',
        isHidden: !showShop || !data.relationShopPoint
      },
      {
        label: '经营者',
        value: data.relationShopChargeName,
        isHidden: !showShop
      },
      {
        label: '联系电话',
        value: data.relationShopChargePhone,
        rightIcon: 'phone-o',
        tag: 'phone',
        isHidden: !showShop
      },
      // 市政设施信息
      {
        label: '设备编号',
        value: data.deviceIndexCode,
        isHidden: !data.deviceIndexCode
      }
    ]
    this.setData({
      baseInfos: baseArr
    })
  },
  previewImage(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.url, // 当前显示图片的链接  
      urls: [event.currentTarget.dataset.url] // 需要预览的图片链接列表  
    })
  },
  previewVideo(event) {
    wx.previewMedia({
      sources: {
        type: 'video',
        url: event.currentTarget.dataset.url
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(param) {
      if (param.type === 'done') {
        //   隐藏底部按钮
        this.setData({
            typeDone: true
        })
      } else if (param.type === 'sup') {
        this.setData({
            isSupervision: true
        })
      }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    const _this = this
    wx.getStorage({
      key: 'caseInfo',
      success(res) {
        const {
          caseNo
        } = res.data;
        Promise.all([
          API.queryDetailById({
            caseNo
          }),
          API.queryCaseOperate({
            caseNo
          })
        ]).then((values) => {
          const info0 = values[0]
          const info1 = values[1]
          const baseInfo = {
            ...info1,
            ...info0
          }
          const {
            options,
            processList,
            collected,
            isEnd,
            inspectResults
          } = baseInfo
          _this.setData({
            active: 'baseInfo',
            options,
            processList,
            baseInfo,
            collected,
            isEnd,
            inspectResults
          })
          _this.queryBasicData()
          _this.getRealtimePic()
          if(baseInfo.urgeTimes) {
              _this.queryUrgeInfo()
          }
        })
      }
    })
  },
  // 获取实时图片
  getRealtimePic() {
    // 报警图片可能存在多张
    const {
      alarmPicList,
      capturePicUrl,
      cameraIndexCode,
      presetCode
    } =
    this.data.baseInfo
    const mediaList = []
    const list = alarmPicList || []
    list.forEach((item) => {
      mediaList.push({
        src: item.picThumbnailUrl,
        picUrl: item.picUrl,
        type: item.fileMediaType,
        isAlarm: true,
        name: item.fileMediaType === 'image' ? '报警图片' : ''
      })
    })
    // 存在已有的抓图，直接使用
    if (capturePicUrl) {
      mediaList.push({
        src: capturePicUrl,
        type: 'image',
        name: '抓拍图片'
      })
      this.setData({
        mediaList
      })
    } else if (cameraIndexCode) {
      // 否则获取实时抓图---有监控点才抓图
      API.getRealtimeCapture({
          cameraIndexCode,
          presetCode
        })
        .then((res) => {
          if (res) {
            mediaList.push({
              src: res,
              type: 'image',
              name: '抓拍图片'
            })
          }
        })
        .finally(() => {
          this.setData({
            mediaList
          })
        })
    } else {
      // 否则只展示报警图片
      this.setData({
        mediaList
      })
    }
  },
  toDeal(event) {
    if(event.currentTarget.dataset.info.name === '反馈' && this.data.inspectResults && this.data.inspectResults.length) {
      wx.setStorage({
        key: 'feacbackCaseNo',
        data: {
          caseNo: this.data.baseInfo.caseNo,
          conclusion: event.currentTarget.dataset.info
        },
        success() {
          wx.navigateTo({
            url: '/pages/case/feedback/feedback?type=deal',
          })
        }
      })
    } else {
      wx.setStorage({
        key: 'feacbackCaseNo',
        data: {
          caseNo: this.data.baseInfo.caseNo,
          conclusion: event.currentTarget.dataset.info
        },
        success() {
          wx.navigateTo({
            url: '/pages/case/feedbacknormal/feedbacknormal?type=deal',
          })
        }
      })
    }
  }
})