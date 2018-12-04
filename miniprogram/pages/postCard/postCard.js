// miniprogram/pages/postCard/postCard.js

const util = require('../../util.js');

var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        inputValue: '',
        searchResult: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    bindKeyInput: function (e) {
        this.setData({
            inputValue: e.detail.value
        })
    },

    search: function() {
        if (this.data.inputValue.length > 0) {
            util.ajax({
                url: 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp',
                method: "GET",
                data: {
                    ct: 25,
                    t: 0,
                    aggr: 1,
                    cr: 1,
                    catZhida: 0,
                    lossless: 0,
                    flag_qc: 0,
                    p: 0,
                    n: 20,
                    w: this.data.inputValue,
                    needNewCode: 1,
                    new_json: 1,
                    format: 'json',
                    platform: 'h5'
                },
                success: (res) => {
                    res = res.data || {};
                    if (res.code == 0 && res.data && res.data.song && res.data.song.list && res.data.song.list.length) {
                        let formattedSongList = res.data.song.list.map((song) => {
                            return util.simpleSongInfo(song);
                        });
                        this.setData({
                            searchResult: this.data.searchResult.concat(formattedSongList)
                        });
                        this.postCard()
                    }
                    else {
                        this.setData({
                            searchResult: []
                        });
                    }
                },
                fail: function (err) {
                    util.tip('搜索失败');
                }
            });
        }
    },

    postCard: function() {
        let song = this.data.searchResult[0];
        const db = wx.cloud.database()
        var currentDate = new Date()
        db.collection('CardInfo').add({
            data: {
                openid: app.globalData.openid,
                poster: app.userInfo,
                imageUrl: 'https://6465-dev-cabb1f-1258145366.tcb.qcloud.la/loocup_cover_0.jpeg?sign=084b4497a91f3e7c0fb2faa115141932&t=1543934657',
                desc: '所有的光芒都向我涌来，所有的氧气都被我吸光，所有的物体都失去重量......',
                time: currentDate.getTime(),
                likedUserIDs: [],
                song: song,
            },
            success: res => {
                wx.showToast({
                    title: '新增记录成功',
                })
                console.log('[CardInfo] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '新增记录失败'
                })
                console.error('[CardInfo] [新增记录] 失败：', err)
            }
        })
    },
})