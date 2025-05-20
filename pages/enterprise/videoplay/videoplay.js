const API = require('@/utils/videoApi.js')
Page({
  data: {
    currentRtmpUrl: '', // 当前播放的RTMP视频URL
    autoplay: true,     // 是否自动播放
    controls: true,     // 是否显示控制条
    monitorPoints: [], // 监控点列表
    selectedMonitorIndex: 0 // 默认选中的监控点索引
  },

  onLoad(options) {
    this.getCameraList()
    // 获取监控点列表
    // 设置默认的RTMP URL（假设为第一个监控点）
    // this.changeRtmpUrl(0);
  },
  getCameraList() {
    API.getAllCameras().then(res => {
      this.setData({
        monitorPoints: res || []
      })
      if(this.data.monitorPoints && this.data.monitorPoints.length) {
        const index = 0;
        this.setData({ selectedMonitorIndex: index });
        this.changeRtmpUrl(index);
        this.changeRtmpUrl(0);
      }
    })
  },
  onChangeMonitor(e) {
    const index = e.detail.value;
    this.setData({ selectedMonitorIndex: index });
    this.changeRtmpUrl(index);
  },

  changeRtmpUrl(index) {
    // 根据选择的监控点更新RTMP URL
    let cameraObj = this.data.monitorPoints[index]
    API.getPreviewParamHtml5({
      "cameraIndexCode": cameraObj.indexCode,
      "protocol": "rtmp",
      "streamType": 1,
      "transmode": 1
    }).then(res => {
      this.setData({
        currentRtmpUrl: res.url
      });
    })
  },

  onStateChange(e) {
    console.log('播放状态改变:', e.detail.code, e.detail.msg);
  }
});