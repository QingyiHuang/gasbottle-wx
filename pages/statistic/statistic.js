const API2 = require('@/utils/statistic.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isToday: true,
    value: '',
    statisticsData: {
      today: [],
      month: []
    },
    filteredData: [],
    showStatistic: '' // manager和supervisor
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getStatisticsData();
  },

  // 切换时间范围
  switchTimeRange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      isToday: type === 'today',
      value: '', // 清空搜索框
      filteredData: [] // 清空过滤数据
    }, () => {
      this.getStatisticsData();
    });
  },

  // 获取统计数据
  getStatisticsData() {
    const now = new Date();
    let startTime, endTime;
    
    if (this.data.isToday) {
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else {
      startTime = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

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
    API2.homepageStatistic(params).then(res => {
      if (res && res.itemCount) {
        this.setData({
          statisticsData: {
            ...this.data.statisticsData,
            [this.data.isToday ? 'today' : 'month']: res.itemCount
          },
          showStatistic: (res.post || '').includes('manager') ? 'manager' : (res.post || '').includes('supervisor') ? 'supervisor' : ''
        }, () => {
          this.filterData();
        });
      } else {
        // 如果没有数据，清空对应时间段的数据
        this.setData({
          statisticsData: {
            ...this.data.statisticsData,
            [this.data.isToday ? 'today' : 'month']: []
          },
          filteredData: [],
          showStatistic: (res.post || '').includes('manager') ? 'manager' : (res.post || '').includes('supervisor') ? 'supervisor' : ''
        });
      }
    });
  },

  // 过滤数据
  filterData() {
    const currentData = this.data.statisticsData[this.data.isToday ? 'today' : 'month'];
    if (!this.data.value) {
      this.setData({
        filteredData: currentData
      });
      return;
    }

    const filtered = currentData.filter(item => {
      if (!item || !item.name) return false;
      return item.name.toLowerCase().includes(this.data.value.toLowerCase());
    });
    console.log(filtered)
    this.setData({
      filteredData: filtered
    });
  },

  // 搜索处理
  onSearch(e) {
    const searchValue = e.detail || '';
    console.log(searchValue)
    this.setData({
      value: searchValue
    }, () => {
      this.filterData();
    });
  },
})