// miniprogram/pages/UserPage/UserPage.js
var app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        collectNum: 0,
        beCollectedNum: 0,
        userInfo:{},
        hostId:"",
        cardInfos: [],
        publishedCards:[],
        collectedCards:[],
        firstfontWeight: 700,
        secondfontWeight: 400,
        tabIndex:0, //0 表示发布页， 1 表示收藏页
    },
    
    onLoad: function (option) {
        // 查看是否授权
        if (!option.userInfo)
        {
            wx.getSetting({
                success(res) {
                    if (res.authSetting['scope.userInfo']) {
                        // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                        wx.getUserInfo({
                            success: function (res) {
                                
                            }
                        })
                    }
                }
            })
        }
        else
        {

        }
        

        this.setData({
            hostId: option.userid
        })

        if(!this.data.hostId)
        {
            this.setData({
                hostId: app.globalData.openid
            }) 
        }
        this.queryCardInfos()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },


    bindGetUserInfo(e) {
        app.userInfo = e.detail.userInfo
    },

    // 拉取个人卡片信息
    queryCardInfos: function () {
        let that = this
        wx.cloud.callFunction({
            name: 'queryPublishedCard',
            data: {
                openid: this.data.hostId,
            },
            success: function (res) {
                console.log('Query Personal CardInfos:', res)
                that.setData({
                    publishedCards: res.result.data,
                })
                that.reloadData()
            },
            fail: console.error
        })
    },

    // 刷新界面
    reloadData: function () {
        if(this.data.tabIndex == 0)
        {
            this.setData({
                cardInfos: this.data.publishedCards,
                firstfontWeight:700,
                secondfontWeight:400
            })
        }
        else{
            this.setData({
                cardInfos: this.data.collectedCards,
                firstfontWeight: 400,
                secondfontWeight: 700
            })
        }
    },

    // 点击了切换tab
    onChangeTab: function(e) {
        let reply = e.target.dataset.replyType;
        console.log('onChangeTab:', reply)
        this.setData({
            tabIndex:reply,
        })
        this.reloadData()
    },

    navigateTo: function(e) {
        let toUrl = '../slideCard/slideCard?cardData=' + JSON.stringify(this.data.tabIndex == 0 ? this.data.publishedCards : this.data.collectedCards) + '&index=' + e.target.id

        wx.navigateTo({
            url: toUrl
        })
    }
})