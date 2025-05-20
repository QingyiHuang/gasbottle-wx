const API = require('@/utils/api')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    names: '',
    items: [],
    showFileField: false,
    showUserField: false,
    fileList: [],
    conclusion: {},
    caseNo: '',
    message: '',
    moduleTitle: '',
    currentCase: {},
    loading: false,
    normal: [
      '很配合，完成自整改。',
      '到现场进行协调处理，完成整改。',
      '不配合，未解决。',
      '未发生违规案件。',
      '不归本辖区管理。'
    ],
    // 待派遣
    assign: [
      '违规案件，请尽快处置。',
      '报警事件已立案，请尽快处置。',
      '确认误报，终止案件。'
    ],
    // 待处置
    deal: [
      '很配合，完成自整改。',
      '到现场进行协调处理，完成整改。',
      '不配合，未解决。',
      '未发生违规案件。',
      '不归本辖区管理。',
      '报警已消除，完成处理。'
    ],
    // 待核查
    check: [
      '完成自整改，同意结案。',
      '案件已解决，同意结案。',
      '执法处置已完成，同意结案。',
      '未完成整改，不予结案。',
      '报警未消除，不予结案。'
    ],
    remarkPickerArr: [],
    chargePersonPickerShow: false,
    activeNames: [],
    activeIds: [],
    activeIndex: 0,
    isRegion: true,
    hasRegion: [],
    noRegion: []
  },
  // 快速选择   
  quickPick(e) {
    this.setData({
      message: e.target.dataset.value
    })
  },
  //   人员选择在勾选所在区域时逻辑
  personPickerShow() {
    this.setData({
      chargePersonPickerShow: true
    })
  },
  bindPickerChange() {},
  onAreaChange() {
    const {
      isRegion,
      hasRegion,
      noRegion
    } = this.data;
    this.setData({
      activeIds: [],
      isRegion: !isRegion,
      items: isRegion ? [...hasRegion] : [...noRegion]
    })
  },
  complete() {
    const {
      activeIds,
      items
    } = this.data;
    const names = {}
    items.forEach(item => {
      item.children.forEach(item => {
        if (activeIds.includes(item.id)) {
          names[item.text] = item.id
        }
      })
    })
    this.setData({
      names: Object.keys(names).join(','),
      chargePersonPickerShow: false
    })
  },
  onClickNav({
    detail = {}
  }) {
    this.setData({
      activeIndex: detail.index || 0,
    });
  },

  onClickItem({
    detail = {}
  }) {
    const {
      activeIds
    } = this.data;
    const index = activeIds.indexOf(detail.id);
    if (index > -1) {
      activeIds.splice(index, 1);
    } else {
      activeIds.push(detail.id);
    }
    this.setData({
      activeIds
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    const _this = this;
    wx.getStorage({
      key: 'feacbackCaseNo',
      success(res) {
        const {
          conclusion,
          caseNo
        } = res.data;
        _this.setData({
          showFileField: conclusion.type.includes('-i'),
          showUserField: conclusion.type.includes('-u'),
          caseNo,
          conclusion
        })
        API.queryCaseOperate({
          caseNo
        }).then((data) => {
          _this.setData({
            currentCase: {
              ...res.data,
              ...data
            },
          })
          // 如果是指派，查询人员
          if (_this.data.showUserField) {
            _this.queryUserByRegion();
            _this.queryAllUser();
          }
        })
      }
    })
    this.setData({
      remarkPickerArr: this.data.normal
    })
  },

  queryUserByRegion() {
    const _this = this
    // 仅所在区域
    API.queryUsers({
      caseNo: this.data.caseNo,
      regionCode: this.data.currentCase.regionIndexCode
    }).then((data) => {
      const items = (data || [])
        .filter((item) => item.users.length > 0)
        .map((item) => {
          const children = item.users.map((user) => {
            return {
              text: user.realName,
              id: user.userId
            }
          })
          return {
            text: item.name,
            children
          }
        })
      _this.setData({
        items: items,
        hasRegion: items
      })
    })

  },

  queryAllUser() {
    const _this = this;
    // 不传所在区域
    API.queryUsers({
      caseNo: this.caseNo
    }).then((data) => {
      const items = (data || [])
        .filter((item) => item.users.length > 0)
        .map((item) => {
          const children = item.users.map((user) => {
            return {
              text: user.realName,
              id: user.userId
            }
          })
          return {
            text: item.name,
            children
          }
        })
      _this.setData({
        noRegion: items
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  //   文件上传相关
  afterRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    API.reportFiles({
      filePath: file.url,
      name: 'files',
      formData: {
        openId: wx.openId
      },
    }).then(res => {
      const {
        fileList
      } = this.data;
      fileList.push({
        ...file,
        url: res[0].picUrl,
        mediaId: res[0].mediaId,
        type: res[0].fileMediaType
      });
      this.setData({
        fileList
      });
    })
  },
  afterDelete(index) {
    const {
      fileList
    } = this.data;
    this.setData({
      fileList: fileList.splice(index, 1)
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  getSubmitParams() {
    const {
      cameraIndexCode,
      presetCode,
      flowInstanceId,
      activeTaskId,
      caseNo,
      caseType,
      gridId
    } = this.data.currentCase
    const {
      type,
      id,
      name
    } = this.data.conclusion;
    const params = {
      caseNo,
      caseType,
      optionId: id,
      optionName: name,
      type: type.replace(/-[iu]/, ''),
      message: this.data.message,
      processInstanceId: flowInstanceId,
      taskId: activeTaskId,
      gridId: gridId
    }
    if (cameraIndexCode && presetCode) {
      params.cameraIndexCode = cameraIndexCode
      params.presetCode = presetCode
    }
    if (type.includes('-i')) {
      params.mediaIds = this.data.fileList.map(item => item.mediaId)
      if (!params.mediaIds.length) {
        wx.showToast({
          title: '请选择文件',
          icon: 'none',
          duration: 2000
        })
        return false
      }
    }
    if (type.includes('-u')) {
      params.chargePerson = this.data.activeIds.join(',')
      if (!params.chargePerson) {
        wx.showToast({
          title: '请选择人员',
          icon: 'none',
          duration: 2000
        })
        return false
      }
    }
    return params
  },
  submit() {
    const params = this.getSubmitParams()
    if (params) {
      wx.showLoading({
        title: '数据保存中...',
      })
      setTimeout(() => {
        wx.hideLoading()
      }, 1000)
      API.dealCase(params)
        .then(() => {
          wx.showToast({
            title: '处置成功',
            icon: 'success',
            duration: 2000
          })
          // 防止退回太快，后台数据没有更新
          setTimeout(() => {
            wx.setStorage({
              key: 'feedbackSuccess',
              data: 'feedbackSuccess',
              success() {
                wx.navigateBack({
                  delta: 2
                })
              }
            })
          }, 2000)
        }).finally(() => {
          wx.hideLoading()
        })
    }
  }
})