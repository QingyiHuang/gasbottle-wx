const API = require('@/utils/api')
Page({
    data: {
        caseTypeName: '全部类型',
        alarmLevelList: [], // 报警等级字典
        caseStatusList: [],
        listData: [], // 初始列表数据  
        loadingMore: false, // 是否正在加载更多  
        noMoreData: false, // 是否没有更多数据  
        page: 1, // 当前页码 
        actionActive: false,
        caseStatus: '',
        //   vantreeselect
        vioTypeId: [],
        vioCategoryIndex: 0,
        vioTypeList: [],
        refreshing: false,
        //   时间选择器
        currentDate: new Date().getTime(),
        maxDate: new Date().getTime(),
        timePickerShow: false,
        timepickerStartOrEnd: '',
        //   搜索条件
        showTypePicker: false,
        searchForm: {
            alarmPlace: '',
            alarmLevel: '',
            alarmTimeEnd: '',
            alarmTimeStart: '',
            overTime: ''
        }
    },

    onLoad() {
        this.queryBaseData();
        // 页面加载时获取初始数据  
        this.getData();
    },
    // 查询基础数据
    queryBaseData() {
        // 查询报警等级字典数据
        API.getDictInfo({
            typeCode: 'alarmLevel'
        }).then(data => {
            this.setData({
                alarmLevelList: data || []
            })
        })
        // 查询所有问题状态
        API.getStatus().then((data) => {
            const list = data || []
            this.setData({
                caseStatusList: [{
                    code: '',
                    name: '全部'
                }, ...list]
            })
        })
        // 查询所有问题类型
        API.getAlarmTypes().then((data) => {
            this.setData({
                vioTypeList: (data || []).map((item) => {
                    const children = item.alarmTypes.map((type) => {
                        return {
                            id: type.codeId,
                            text: type.name
                        }
                    })
                    return {
                        id: item.code,
                        text: item.name,
                        children
                    }
                })
            })
        })
    },

    // 获取数据的方法，可以根据实际情况调整（例如使用 wx.request 发起网络请求）  
    getData() {
        if (this.data.page === 1) {
            this.setData({
                listData: []
            });
        }
        let searchParams = {
            ...this.data.searchForm,
            caseTypeId: this.data.vioTypeId.join(),
            caseStatus: this.data.caseStatus || ''
        }
        API.queryTodoList({
            pageNo: this.data.page,
            pageSize: 10,
            ...searchParams,
            // caseNo: '322024121855530a7'
        }).then(data => {
            const {
                total,
                list
            } = data;
            const {
                listData
            } = this.data
            const rows = listData.concat(list || [])
            this.setData({
                listData: rows,
                page: this.data.page + 1,
                loadingMore: false,
                noMoreData: rows.length === total
            });
            this.setData({
                refreshing: false
            })
        })
        this.setData({
            refreshing: false
        })
    },

    // 加载更多数据的方法  
    loadMore() {
        if (this.data.loadingMore || this.data.noMoreData) {
            // 正在加载或没有更多数据，直接返回  
            return;
        }
        this.setData({
            loadingMore: true, // 设置加载状态为 true  
        });
        // 调用获取数据的方法加载更多  
        this.getData();
    },
    // 下拉刷新
    refreshScroll() {
        this.setData({
            refreshing: true
        })
        this.search()

    },
    onTabChange(event) {
        this.setData({
            caseStatus: event.detail.name,
            page: 1
        })
        this.getData()

    },
    keywordChange(event) {
        this.setData({
            page: 1,
            searchForm: {
                ...this.data.searchForm,
                alarmPlace: event.detail
            }
        })
        this.getData()
    },

    formatTime(time) {
        const date = new Date(time)
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        return `${year}-${this.formatNumber(month)}-${this.formatNumber(day)} ${this.formatNumber(hour)}:${this.formatNumber(minute)}:${this.formatNumber(second)}`;
    },
    formatNumber(n) {
        n = n.toString();
        return n[1] ? n : '0' + n;
    },
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    todetail(event) {
        wx.setStorage({
            key: 'caseInfo',
            data: event.currentTarget.dataset.info,
            success() {
                wx.navigateTo({
                    url: '/pages/case/tododetail/tododetail',
                })
            }
        })

    },
    // 如果是从处置页面处置成功返回，需要重新查询列表
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
    showSearchAction() {
        this.setData({
            actionActive: !this.data.actionActive
        })
    },
    onfilterPopUpClose() {
        this.setData({
            actionActive: false
        })
    },
    onChangeWt(val) {
        this.setData({
            searchForm: {
                ...this.data.searchForm,
                ...{
                    alarmLevel: val.detail
                }
            }
        })
    },
    onChangeOt(val) {
        this.setData({
            searchForm: {
                ...this.data.searchForm,
                ...{
                    overTime: val.detail
                }
            }
        })
    },
    openTypePicker() {
        this.setData({
            showTypePicker: true
        })
    },
    closeTypePicker() {
        this.setData({
            showTypePicker: false
        })
    },
    // 违规类型选择和重置
    resetSelectType() {
        this.setData({
            vioTypeId: [],
            vioCategoryIndex: 0,
        });
    },
    finishedSelectType() {
        let caseTypeName = '全部类型'
        const {
            vioTypeList,
            vioTypeId
        } = this.data;
        const len = vioTypeId.length
        if (len) {
            if (len > 1) {
                caseTypeName = '已选择' + len + '项'
            } else {
                vioTypeList.forEach(item => {
                    item.children.forEach(type => {
                        if (type.id === vioTypeId[0]) {
                            caseTypeName = type.text
                        }
                    })
                })
            }
        }
        this.setData({
            caseTypeName
        });
        this.closeTypePicker()
    },
    onClickNav({
        detail = {}
    }) {
        this.setData({
            vioCategoryIndex: detail.index || 0,
        });
    },

    onClickItem({
        detail = {}
    }) {
        const {
            vioTypeId
        } = this.data;

        const index = vioTypeId.indexOf(detail.id);
        if (index > -1) {
            vioTypeId.splice(index, 1);
        } else {
            vioTypeId.push(detail.id);
        }

        this.setData({
            vioTypeId
        });
    },
    // 导航
    gotolocation(e) {
        const {
            alarmPlace,
            latitude,
            longitude
        } = e.currentTarget.dataset.location
        if (longitude && latitude) {
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
    // 时间选择器开始和结束
    opentimePicker(e) {
        this.setData({
            timepickerStartOrEnd: e.target.dataset.id,
            timePickerShow: true
        })
    },
    searchReset() {
        this.setData({
            searchForm: {
                alarmPlace: '',
                alarmLevel: '',
                alarmTimeEnd: '',
                alarmTimeStart: '',
                overTime: ''
            },
            actionActive: false,
            page: 1,
            listData: [],
            caseTypeName: '全部类型'
        })
        this.resetSelectType()
        this.getData()
    },
    search() {
        if (this.data.searchForm.alarmTimeEnd && !this.data.searchForm.alarmTimeStart) {
            wx.showToast({
                title: '请选择开始时间',
                icon: 'none'
            })
            return
        }
        if (!this.data.searchForm.alarmTimeEnd && this.data.searchForm.alarmTimeStart) {
            wx.showToast({
                title: '请选择结束时间',
                icon: 'none'
            })
            return
        }
        if (this.data.searchForm.alarmTimeEnd && this.data.searchForm.alarmTimeStart && (new Date(this.data.searchForm.alarmTimeStart).getTime() >= new Date(this.data.searchForm.alarmTimeEnd).getTime())) {
            wx.showToast({
                title: '开始时间不能大于结束时间',
                icon: 'none'
            })
            return
        }
        this.setData({
            actionActive: false,
            page: 1,
            listData: []
        })
        // 重置当前page，并重新查询
        this.getData()
    },
    onInput(event) {
        this.setData({
            currentDate: event.detail,
        });
    },
    onTimeCancel() {
        this.setData({
            timePickerShow: false
        })
    },
    onTimeConfirm() {
        // 违规时间
        if (this.data.timepickerStartOrEnd === 'start') {
            this.setData({
                timePickerShow: false,
                'searchForm.alarmTimeStart': this.formatTime(this.data.currentDate)
            })
        } else {
            this.setData({
                timePickerShow: false,
                'searchForm.alarmTimeEnd': this.formatTime(this.data.currentDate)
            })
        }
    },
    // 督办相关接口
    // 结束督办
    endDuban () {
        const promptAgain = localStorage.getItem('end_duban')
        // 判断是否已经点了不再提示
        if (promptAgain === 'false') {
          this.sendEndDuban()
        } else {
          Dialog.confirm({
            title: '结束督办',
            showCancelButton: true,
            confirmButtonText: '确定',
            cancelButtonText: '不再提示',
            confirmButtonColor: '#3D75F4',
            message:
              '结束督办后，问题将从 “督办问题” 中删除，且不再接收问题处置进展通知。',
            beforeClose: (action, done) => {
              if (action === 'confirm') {
                this.sendEndDuban()
              } else {
                localStorage.setItem('end_duban', 'false')
              }
              done()
            }
          })
        }
    },
    // 督办
    duban () {
      const promptAgain = localStorage.getItem('duban')
      // 判断是否已经点了不再提示
      if (promptAgain === 'false') {
        // 不再提示，直接调用督办接口
        this.sendDuban()
      } else {
        Dialog.confirm({
          title: '督办',
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '不再提示',
          confirmButtonColor: '#3D75F4',
          message:
            '将实时跟进问题处置状态，可在 “督办问题” 中查看全部督办问题。',
          beforeClose: (action, done) => {
            if (action === 'confirm') {
              this.sendDuban()
            } else {
              localStorage.setItem('duban', 'false')
            }
            done()
          }
        })
      }
    },
    // 催办
    cuiban () {
      this.message = '当前问题已被督办，请尽快完成处置'
      this.showDialog = true
    },
});