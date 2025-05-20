const API = require('@/utils/eApi')
Page({
  data: {
    tabs: [],
    refreshing: false,
    noMoreData: false,
    loadingMore: false,
    listData: [],
    page: 1, // 当前页码 
    searchForm: {
      "keyWord": "",
      "orderType": "desc",
      "taskStatus": ""
    },
    auditAuth: false,
    timeoutFilter: '',
    timeoutOptions: [
      { text: '全部', value: '' },
      { text: '超时', value: true },
      { text: '未超时', value: false }
    ],
    completeNum: 0,
    inAuditNum: 0,
    inProgressNum: 0,
    totalNum: 0
  },
  onLoad(options) {
    // 页面加载时获取初始数据  
    this.getDict()
    this.getAuditAuth()
  },
  onReady() {

  },
  getAuditAuth() {
    API.checkAuditAbility().then(res => {
      this.setData({
        auditAuth: res
      })
    })
  },
  // 请求新数据
  getNewData() {
    this.setData({
      page: 1,
      listData: []
    })
    this.getData()
  },
  // 搜索栏变化
  onSearchChange(e){
    this.setData({
      searchForm: {
        ...this.data.searchForm,
        keyWord: e.detail,
        overdueFlag: this.data.timeoutFilter
      }
    })
  },
  onSearch() {
    this.getNewData()
  },
  getDict() {
    // API.queryDicts({
    //   type: 'taskStatus'
    // }).then(res => {
    //   // 过滤掉 name 为 "已终止" 的值
    //   const filteredRes = res.filter(item => item.name !== '已终止');
    //   if (filteredRes.length) {
    //     this.setData({
    //       tabs: filteredRes, // 使用过滤后的结果
    //       searchForm: {
    //         ...this.data.searchForm,
    //         taskStatus: (filteredRes && filteredRes.length) ? filteredRes[0].code : ''
    //       }
    //     });
    //   }
    //   this.getData();
    // });
    this.setData({
      tabs: [
        {name: '全部', code: ''},
        {name: '待处理', code: '1'},
        {name: '待审核', code: '4'},
        {name: '已完成', code: '3'}
      ]
    });
      const filteredRes = this.data.tabs
      if (filteredRes.length) {
        this.setData({
          tabs: filteredRes, // 使用过滤后的结果
          searchForm: {
            ...this.data.searchForm,
            taskStatus: (filteredRes && filteredRes.length) ? filteredRes[0].code : '',
            overdueFlag: this.data.timeoutFilter
          }
        });
      }
      this.getData();
  },
  // tab切换
  async onTabChange(e) {
    this.setData({
      searchForm: {
        ...this.data.searchForm,
        taskStatus: e.detail.name === 0 ? '' : e.detail.name,
        overdueFlag: this.data.timeoutFilter
      }
    }, async () => {
      await this.getNewData()
    })
  },
  // 加载更多数据的方法  
  loadMore() {
    if (this.data.loadingMore || this.data.noMoreData) {
      return;
    }
    this.setData({
      loadingMore: true,
    });
    this.getData();
  },
  // 下拉刷新
  refreshScroll() {
    this.setData({
      refreshing: true
    })
    this.getNewData()
  },
  async getData() {
    try {
      // 清空列表数据仅当页面是第一页时
      if (this.data.page === 1) {
        this.setData({ listData: [] });
      }
      // 构建搜索参数
      const searchParams = { ...this.data.searchForm, overdueFlag: this.data.timeoutFilter };
      // 发起请求并等待结果
      const response = await API.queryTaskByPage({
        pageNo: this.data.page,
        pageSize: 10,
        ...searchParams
      });
      // 如果有响应数据，则更新状态
      if (response) {
        const { total, list = [] } = response;
        const { listData = [] } = this.data;
        const updatedListData = listData.concat(list);
        const noMoreData = updatedListData.length >= total;
  
        this.setData({
          refreshing: false,
          loadingMore: false,
          listData: updatedListData,
          page: this.data.page + 1,
          noMoreData
        });
      }
      const res2 = await API.queryTaskOverview({
        keyword: this.data.searchForm.keyWord,
        overdueFlag: this.data.timeoutFilter
      })
      this.setData({
        completeNum: res2.completeNum > 99 ? '99+' : res2.completeNum,
        inAuditNum: res2.inAuditNum > 99 ? '99+' : res2.inAuditNum,
        inProgressNum: res2.inProgressNum > 99 ? '99+' : res2.inProgressNum,
        totalNum: res2.totalNum > 99 ? '99+' : res2.totalNum
      })
    } catch (error) {
      this.setData({
        refreshing: false,
        loadingMore: false
      });
    }
  },
  todetail(event) {
    wx.setStorage({
      key: 'patrolInfo',
      data: event.currentTarget.dataset.info,
      success: () => {
        wx.navigateTo({
          url: '/pages/enterprise/patroldetail/patroldetail' + `?type=${this.data.searchForm.taskStatus}&isaudit=${this.data.auditAuth}`
        })
      }
    })
  },
  onShow() {
      const _this = this;
      wx.getStorage({
          key: 'feedbackSuccess',
          success(res) {
              if (res.data === 'feedbackSuccess') {
                  wx.removeStorage({
                      key: 'feedbackSuccess'
                  })
                  _this.setData({
                      page: 1
                  })
                  _this.getData()
              }
          }
      })
  },
  onTimeoutChange(event) {
    const value = event.detail;
    this.setData({
      timeoutFilter: value
    });
    // 这里可以调用获取列表数据的方法
    this.getNewData();
  },
})