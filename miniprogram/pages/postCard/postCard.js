// miniprogram/pages/postCard/postCard.js

const util = require('../../util.js');
const COS = require('../../cos-wx-sdk-v5.js');
const color = require('../../color.js').color;
const canvasId = "img-canvas";

var app = getApp();
var config = {
    Bucket: 'loocup-1257446936',
    Region: 'ap-chengdu'
};
var taskId;

// 初始化实例
var cos = new COS({
    getAuthorization: function(options, callback) {
        var authorization = COS.getAuthorization({
            SecretId: 'AKIDmRwGiNeObnrjR19fiJo7EBwXwCKG39qL',
            SecretKey: 'Unu34tXGD5nKivGQO9jMtMdtCLQKH5k0',
            Method: options.Method,
            Key: options.Key,
            Query: options.Query,
            Headers: options.Headers,
            Expires: 60,
        });
        callback(authorization);
    }
});

Page({

    /**
     * 页面的初始数据
     */
    data: {
        inputValue: '',
        searchResult: [],
        song: null,
        songName: '添加歌曲',
        uploadedImageUrl: '../../images/post_default_image.png',
        magicColor:'#909090',
        desc: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    bindKeyInput: function(e) {
        this.setData({
            inputValue: e.detail.value
        })
    },

    changeSong: function (song, startTime, endTime) {
        this.setData({
            song: song,
            songName: song.name + ' · ' + song.singer,
        })
        wx.navigateBack({
            
        })
    },

    bindDescInput: function (e) {
        this.setData({
            desc: e.detail.value
        })
    },

    chooseImageAndUpload: function() {
        let that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function(res) {
                cos.postObject({
                    Bucket: config.Bucket,
                    Region: config.Region,
                    Key: that.getImageKey(),
                    FilePath: res.tempFilePaths[0],
                    TaskReady: function(tid) {
                        taskId = tid
                    },
                    onProgress: function(info) {
                        console.log(JSON.stringify(info));
                    }
                }, function(err, data) {
                    console.log(err || data);
                    
                    that.setData({
                        uploadedImageUrl: data.Location,
                    })
                    console.log("uploadedImageUrl", res.tempFilePaths[0])
                    color.colors(res.tempFilePaths[0], canvasId, {
                        success: function (res) {
                            console.log('转换成功', color.rgbToHex(res.dominant))
                            that.setData({
                                magicColor: color.rgbToHex(res.dominant),
                            })
                        },
                        width: 240,
                        height: 480
                    });
                    if (err && err.error) {
                        wx.showModal({
                            title: '上传失败',
                            content: '上传失败：' + (err.error.Message || err.error) + '；状态码：' + err.statusCode,
                            showCancel: false
                        });
                    } else if (err) {
                        wx.showModal({
                            title: '上传出错',
                            content: '上传出错：' + err + '；状态码：' + err.statusCode,
                            showCancel: false
                        });
                    } else {
                        wx.showToast({
                            title: '上传成功',
                            icon: 'success',
                            duration: 1000
                        });
                    }
                });
            }
        })
    },


    calculateThemeFinished: function (color) {
        console.log('result color', color)
    },

    postCard: function() {
        if (this.data.song == null) {
            wx.showToast({
                title: '请选择歌曲',
                icon: 'none',
                duration: 1000
            });
            return
        }
        if (this.data.uploadedImageUrl.length == 0) {
            wx.showToast({
                title: '请选择图片上传',
                icon: 'none',
                duration: 1000
            });
            return
        }
        if (this.data.desc.length == 0) {
            wx.showToast({
                title: '请输入心情',
                icon: 'none',
                duration: 1000
            });
            return
        }

        let song = this.data.song;
        const db = wx.cloud.database()
        var currentDate = new Date()
        db.collection('CardInfo').add({
            data: {
                openid: app.globalData.openid,
                poster: app.userInfo,
                imageUrl: this.data.uploadedImageUrl,
                magicColor: this.data.magicColor,
                desc: this.data.desc,
                time: currentDate.getTime(),
                likedUserIDs: [],
                song: song,
            },
            success: res => {
                wx.showToast({
                    title: '发布成功',
                    duration: 1000,
                })
                console.log('[CardInfo] [新增记录] 成功，记录 _id: ', res._id)
                let that = this
                setTimeout(function () {
                    let pages = getCurrentPages();//当前页面
                    let prevPage = pages[pages.length - 2];//上一页面
                    var cardInfo = {}
                    cardInfo.openid = app.globalData.openid
                    cardInfo.poster = app.userInfo
                    cardInfo.imageUrl = that.data.uploadedImageUrl
                    cardInfo.magicColor = that.data.magicColor
                    cardInfo.desc = that.data.desc
                    cardInfo.time = currentDate.getTime()
                    cardInfo.likedUserIDs = []
                    cardInfo.song = song
                    prevPage.setData({//直接给上移页面赋值
                        newPostCardInfo:cardInfo
                    });
                    wx.navigateBack({
                        delta:1
                    })
                }, 1000);
                
            },
            fail: err => {
                wx.showToast({
                    icon: 'none',
                    title: '发布失败'
                })
                console.error('[CardInfo] [新增记录] 失败：', err)
            }
        })
    },

    addSong: function() {
        wx.navigateTo({
            url: '../selectSong/selectSong',
        })
    },

    getImageKey: function() {
        var currentdate = new Date();
        var datetime = "Image_" + currentdate.getFullYear() + "_" +
            (currentdate.getMonth() + 1) + "_" +
            currentdate.getDate() + "_" +
            currentdate.getHours() + "_" +
            currentdate.getMinutes() + "_" +
            currentdate.getSeconds() + "_" +
            currentdate.getMilliseconds() + "_" +
            Math.floor((Math.random() * 100000) + 1);
        return datetime;
    }
})
