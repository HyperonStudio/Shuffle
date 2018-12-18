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
        magicColor:'#000000',
        desc: '',
        startTime: 0,
        endTime: 0,
        isVCVisible: false,
    },

    onShow: function() {
        this.setData({
            isVCVisible: true
        })
    },

    onHide: function () {
        this.setData({
            isVCVisible: false
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.globalData.selectNotAlbumImage = false
        app.globalData.selectImageTmpPath = ''
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
            startTime: startTime,
            endTime: endTime,
        })
        console.log('选择歌曲完毕: ', song, ', 从', startTime, '到', endTime)
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
                app.globalData.selectNotAlbumImage = true
                app.globalData.selectImageTmpPath = res.tempFilePaths[0]
                that.uploadImage()
            }
        })
    },

    uploadImage: function() {
        let that = this;
        cos.postObject({
            Bucket: config.Bucket,
            Region: config.Region,
            Key: that.getImageKey(),
            FilePath: app.globalData.selectImageTmpPath,
            TaskReady: function (tid) {
                taskId = tid
            },
            onProgress: function (info) {
                console.log(JSON.stringify(info));
            }
        }, function (err, data) {
            console.log(err || data);

            that.setData({
                uploadedImageUrl: data.Location,
            })
            console.log("uploadedImageUrl", app.globalData.selectImageTmpPath)
            // that.calculateMagicColor()
            if (err && err.error) {
                if (that.data.isVCVisible) {
                    wx.showModal({
                        title: '上传失败',
                        content: '上传失败：' + (err.error.Message || err.error) + '；状态码：' + err.statusCode,
                        showCancel: false
                    });
                }
            } else if (err) {
                if (that.data.isVCVisible) {
                    wx.showModal({
                        title: '上传出错',
                        content: '上传出错：' + err + '；状态码：' + err.statusCode,
                        showCancel: false
                    });
                }
            } else {
                if (that.data.isVCVisible) {
                    wx.showToast({
                        title: '上传成功',
                        icon: 'success',
                        duration: 1000
                    });
                }
            }
        });
    },

    clearImage: function() {
        this.setData({
            uploadedImageUrl: '../../images/post_default_image.png',
        })
    },

    calculateMagicColor: function() {
        let that = this
        color.colors(app.globalData.selectImageTmpPath, canvasId, {
            success: function (res) {
                console.log('转换成功', color.rgbToHex(res.dominant))
                that.setData({
                    magicColor: color.rgbToHex(res.dominant),
                })
            },
            width: 720,
            height: 1024
        });
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
                startTime: this.data.startTime,
                endTime: this.data.endTime,
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
