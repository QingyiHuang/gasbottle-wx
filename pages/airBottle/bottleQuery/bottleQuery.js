const API = require('@/utils/gasApi')
import { formatTime } from '@/utils/util'
Page({
  data: {
    // 分页参数
    refreshing: false,
    loadingMore: false, // 是否正在加载更多  
    noMoreData: false, // 是否没有更多数据  
    page: 1, // 当前页码 
    listData: [],
    option1: [{
      text: '全部',
      value: ''
    }],
    option2: [{
      text: '全部',
      value: ''
    }],
    option3: [{
      text: '全部',
      value: ''
    }],
    dropTitle1: '气瓶状态',
    dropTitle2: '流转状态',
    dropTitle3: '登记单位',
    value1: '',
    value2: '',
    value3: '',
    searchValue: ''
  },
  onLoad(options) {
    this.initDict()
    // 页面加载时获取初始数据  
    this.getData();
  },
  onReady() {

  },
  // 初始化字典
  initDict() {
    API.gasBottleStatusDist().then(res => {
      const arr = this.initDictFunc(res)
      this.setData({
        option1: this.data.option1.concat(arr)
      })
    })
    API.gasBottleTrafficDist().then(res => {
      const arr = this.initDictFunc(res)
      this.setData({
        option2: this.data.option2.concat(arr)
      })
    })
    // API.gasBottleTypeDist().then(res => {

    // })
    API.registrationUnitList({}).then(res => {
      let arr = []
      res.forEach(element => {
        arr.push({
          text: element.companyName,
          value: element.companyName
        })
      });
      this.setData({
        option3: this.data.option3.concat(arr)
      })
    })
  },
  initDictFunc(res) {
    let arr = []
    res.forEach(element => {
      arr.push({
        text: element.value,
        value: element.key
      })
    });
    return arr
  },
  // 选项变化
  dropChange1(e) {
    this.dropChangeFunc(e.detail, this.data.option1, '气瓶状态')
  },
  dropChange2(e) {
    this.dropChangeFunc(e.detail, this.data.option2, '流转状态')
  },
  dropChange3(e) {
    this.dropChangeFunc(e.detail, this.data.option3, '登记单位')
  },
  dropChangeFunc(detail, optionArr, dropTitle) {
    // 定义一个映射表，用于关联 dropTitle 和对应的 setData 键名
    const titleMap = {
      '气瓶状态': ['dropTitle1', 'value1'],
      '流转状态': ['dropTitle2', 'value2'],
      '登记单位': ['dropTitle3', 'value3']
    };
    // 根据 dropTitle 获取对应的键名
    const [titleKey, valueKey] = titleMap[dropTitle] || ['dropTitle1', 'value1'];
    if (detail === '') {
      this.setData({
        [titleKey]: dropTitle,
        [valueKey]: detail
      });
    } else {
      const row = optionArr.find(item => item.value === detail);
      if (row) {
        this.setData({
          [valueKey]: detail,
          [titleKey]: row.text
        });
      }
    }
    this.search()
  },
  // 搜索值变化
  keywordChange(event) {
    this.setData({
        page: 1,
        searchValue: event.detail
    })
    this.getData()
  },
  // 从url中截取气瓶编号
  getIdFromUrlOrNumber(input) {
    // 正则表达式用于匹配：
    // 1. URL路径中的最后一个数字序列
    // 2. 纯数字字符串
    // 3. URL查询参数中的数字（如 ?d=7301955047）
    // 4. URL中最后一个等号后的数据（如 qpcode=7302960085）
    const pattern = /(?:\/(\d+))[^\/]*$|^(?=\d+$)(\d+)$|(?:\?[^=]*=(\d+))$|(?:[^=]*=(\d+))$/;
    let match = input.match(pattern);
    if (match) {
      // 如果匹配成功，返回第一个捕获组（斜杠后的数字）或第二个捕获组（纯数字）或第三个捕获组（查询参数中的数字）或第四个捕获组（最后一个等号后的数字）
      return match[1] || match[2] || match[3] || match[4];
    } else {
      console.error('Invalid input:', input);
      return null;
    }
  },
  sanCode() {
    wx.scanCode({
      onlyFromCamera: false, // 是否只能从相机扫码，默认false，允许从相册选择图片
      scanType: ['qrCode'],
      success: (res) => {
        if (res.path) { // 如果二维码包含的是小程序页面路径
          wx.showToast({
            title: '请扫码气瓶二维码',
            icon: 'none'
          });
        } else {
          let result2 = this.getIdFromUrlOrNumber(res.result)
          this.setData({
            searchValue: result2
          })
          this.search()
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '扫描失败，请重试',
          icon: 'none'
        });
      }
    });
  },
  todetail(e) {
    wx.navigateTo({
      url: '/pages/airBottle/bottleQueryDetail/bottleQueryDetail?barCode=' + e.currentTarget.dataset.info.barCode,
    })
  },
  // 分页查询
  getData() {
    if (this.data.page === 1) {
      this.setData({
        listData: []
      });
    }
    API.gasBottlePage({
      "barCode": this.data.searchValue,
      "pageNo": this.data.page,
      "pageSize": 10,
      "status": this.data.value1,
      registrationUnit: this.data.value3,
      "trafficStatus": this.data.value2
    }).then(data => {
      this.setData({
        refreshing: false
      })
      const {
        total,
        list
      } = data;
      const {
        listData
      } = this.data
      list.forEach(item => {
        if (item.scrapDate) {
          item.scrapDate = formatTime(item.scrapDate)
        }
        if (item.localExamineTime) {
          item.localExamineTime = formatTime(item.localExamineTime)
        }
        if (item.examineTime) {
          item.examineTime = formatTime(item.examineTime)
        }
      })
      const rows = listData.concat(list || [])
      this.setData({
        listData: rows,
        page: this.data.page + 1,
        loadingMore: false,
        noMoreData: rows.length === total
      });
    })
    this.setData({
      refreshing: false
    })
  },
  // 加载更多数据的方法  
  loadMore() {
    if (this.data.loadingMore || this.data.noMoreData) {
      return;
    }
    this.setData({
      loadingMore: true, // 设置加载状态为 true  
    });
    this.getData();
  },
  // 下拉刷新
  refreshScroll() {
    this.setData({
      refreshing: true
    })
    this.search()
  },
  search() {
    this.setData({
        page: 1,
    })
    this.getData()
  }
})