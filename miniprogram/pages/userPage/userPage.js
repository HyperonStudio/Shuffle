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
        user:{},
    },
    
    onLoad: function (option) {
        //查看是否授权
        let openId = option.openId
        let user = JSON.parse(option.user)
        console.log("openid"+openId)
        this.setData({
            hostId: openId,
            user: user,
        })

        if(!this.data.hostId)
        {
            this.setData({
                hostId: app.globalData.openid
            }) 
        }
        this.queryCardInfos()
        this.queryCollectedCardInfos()
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

    queryCollectedCardInfos: function () {
        let that = this
        wx.cloud.callFunction({
            name: 'queryCollectedCard',
            data: {

            },
            success: function (res) {
                console.log('Query Collected CardInfos:', res)
                var resultList = res.result.data;
                var filterdList = new Array();
                var numbecollect = 0;

                for (var i=0; i<resultList.length; i++)
                {
                    var cardInfo = resultList[i]
                    if (cardInfo._openid == that.data.hostId)
                    {
                        numbecollect += cardInfo.likedUserIDs.length;
                    }
                    for (var j = 0; j < cardInfo.likedUserIDs.length;j++)
                    {
                        var userid = cardInfo.likedUserIDs[j]
                        if (userid == that.data.hostId)
                        {
                            filterdList.push(cardInfo);
                            continue
                        }
                    }
                }
                console.log('filtered', filterdList)
                that.setData({
                    collectedCards: filterdList,
                    collectNum: filterdList.length,
                    beCollectedNum: numbecollect
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