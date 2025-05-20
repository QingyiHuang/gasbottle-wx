const API = require('@/utils/gasApi.js')
const API2 = require('@/utils/statistic.js')
Page({
  data: {
    arr: [{
      content: 'xxxxxxxxxxxxxxxxx',
      id: '2222'
    },{
      content: 'yuuuuuuuurrrrrrrrrrrrrrrrrrr',
      id: '33333'
    }],
    errorP: '',
    openId: '',
    userRoleArr: [],
    isToday: true,
    menuList1: [
      {
        name: '扫码入库',
        menuIcon: '../images/p1(1).png',
        menuCode: 'instore',
        key: 'abis01'
      },
      {
        name: '扫码出库',
        menuIcon: '../images/p1(3).png',
        menuCode: 'outstore',
        key: 'abis02'
      },
      {
        name: '气瓶签收',
        menuIcon: '../images/p1(2).png',
        menuCode: 'signstore',
        key: 'abis03'
      },
      {
        name: '气瓶查询',
        menuIcon: '../images/p1(6).png',
        menuCode: 'bottleQuery',
        key: 'abis04'
      }
    ],
    menuList2: [
      {
        name: '企业巡查',
        menuIcon: '../images/p1(4).png',
        menuCode: 'patrol',
        key: 'ptl01'
      }
      // {
      //   name: '视频预览',
      //   menuIcon: '../images/app_video.png',
      //   menuCode: 'videoplay',
      //   key: 'ptl02'
      // }
    ],
    menuList3: [
      {
        name: '我的待办',
        menuIcon: '../images/p1(6).png',
        menuCode: 'todolist',
        key: 'case01'
      },
      {
        name: '我的经办',
        menuIcon: '../images/p1(7).png',
        menuCode: 'donelist',
        key: 'case02'
      },
      {
        name: '隐患查询',
        menuIcon: '../images/p1(5).png',
        menuCode: 'caselist',
        key: 'case03'
      },
    ],
    showMenu: false,
    personName: '',
    companyName: '',
    // 统计数据
    arriveCount: 0,
    deliveryCount: 0,
    storeCount: 0,
    showStatistic: '' // manager和supervisor
  },
  onLoad(options) {
    this.setData({
      errorP: ''
    })
    this.getMenuPow()
    // 查询统计
    this.getStatisticsData()
  },
  onShow() {
    wx.removeStorage({
      key: 'signCheckList',
    })
  },
  pageJump(e) {
    let path = e.currentTarget.dataset.id
    if(['todolist', 'donelist', 'caselist', 'feedback', 'tododetail'].includes(path)) {
      wx.navigateTo({
        url: '/pages/case/' + path + '/' + path,
      })
    } else if (['patrol', 'videoplay'].includes(path)) {
      wx.navigateTo({
        url: '/pages/enterprise/' + path + '/' + path
      })
    } else if(['bottleQuery', 'instore', 'outstore', 'signstore'].includes(path)) {
      wx.navigateTo({
        url: '/pages/airBottle/' + path + '/' + path
      })
    }
  },
  buygas() {
    wx.navigateTo({
      url: '/pages/airBottle/buygas/buygas'
    })
  },
  toStatistic() {
    wx.navigateTo({
      url: '/pages/statistic/statistic'
    })
  },
  // 获取菜单权限
  getMenuPow() {
    API.userPostList({}).then(res => {
      if(res && res.length) {
        let userRoleArr = []
        res.map(item => {
          userRoleArr.push(item.post)
        })
        this.setData({
          userRoleArr
        })
        this.filterMenusByRole()
      }
    })
  },
  // 菜单赋值
  filterMenusByRole () {
    const { userRoleArr, menuList1, menuList2, menuList3 } = this.data;
    // 根据角色定义可访问的key集合
    const accessibleKeys = new Set();
    if (userRoleArr.includes('selectman')) {
      accessibleKeys.add('ptl01');
      accessibleKeys.add('ptl02');
    }
    if (userRoleArr.includes('courier')) {
      accessibleKeys.add('abis02');
      accessibleKeys.add('abis03');
    }
    if (userRoleArr.includes('manager')) {
      accessibleKeys.add('abis04');
      accessibleKeys.add('ptl01');
      accessibleKeys.add('ptl02');
      accessibleKeys.add('case01');
      accessibleKeys.add('case02');
      accessibleKeys.add('case03');
    }
    if(userRoleArr.includes('supervisor')) {
      accessibleKeys.add('abis01')
      accessibleKeys.add('abis04');
      accessibleKeys.add('ptl01');
      accessibleKeys.add('ptl02');
    }
    // 过滤菜单列表
    const filteredMenuList1 = menuList1.filter(item => accessibleKeys.has(item.key));
    const filteredMenuList2 = menuList2.filter(item => accessibleKeys.has(item.key));
    const filteredMenuList3 = menuList3.filter(item => accessibleKeys.has(item.key));
    // 更新数据
    this.setData({
      menuList1: filteredMenuList1,
      menuList2: filteredMenuList2,
      menuList3: filteredMenuList3,
      showMenu: true
    });
  },
  // 切换时间范围
  switchTimeRange(e) {
    const type = e.currentTarget.dataset.type;
    if (!type) {
      console.error('未获取到切换类型');
      return;
    }
    
    this.setData({
      isToday: type === 'today'
    }, () => {
      console.log('切换完成，当前状态:', this.data.isToday);
      this.getStatisticsData();
    });
  },
  // 获取统计数据
  getStatisticsData() {
    const now = new Date();
    let startTime, endTime;
    
    if (this.data.isToday) {
      // 获取今日的开始时间（00:00:00）
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      // 获取今日的结束时间（23:59:59）
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else {
      // 获取本月的开始时间（1号 00:00:00）
      startTime = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      // 获取本月的结束时间（最后一天 23:59:59）
      endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // 格式化时间为 YYYY-MM-DD HH:mm:ss
    const formatTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    const params = {
      startTime: formatTime(startTime),
      endTime: formatTime(endTime)
    }
    // const params = {
    //   startTime: this.data.isToday ? '2024-12-01 00:00:00' : '2024-12-01 00:00:00',
    //   endTime: this.data.isToday ? '2024-12-01 23:00:00' : '2024-12-31 23:59:59'
    // }
    API2.homepageStatistic(params).then(res => {
      this.setData({
        personName: res.personName,
        companyName: res.companyName || res.postName,
        arriveCount: this.numHandleMax(res.arriveCount || 0),
        deliveryCount: this.numHandleMax(res.deliveryCount || 0),
        storeCount: this.numHandleMax(res.storeCount || 0),
        showStatistic: (res.post || '').includes('manager') ? 'manager' : (res.post || '').includes('supervisor') ? 'supervisor' : ''
      })
    })
  },
  numHandleMax(val) {
    if (val > 9999) {
      return '9999+'
    } else {
      return val
    }
  } 
})