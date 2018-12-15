// miniprogram/pages/selectSongRange/selectSongRange.js

let kSelectorHorizontalMargin = 35;
let kTestSong = {
    albummid:"000EZRMz16VmbQ",
    disableplay:0,
    disableposter:0,
    image:"https://y.gtimg.cn/music/photo_new/T002R150x150M000000EZRMz16VmbQ.jpg?max_age=2592000",
    mid:"0049uIUl1lic4s",
    name:"She's On My Mind",
    singer:"JP Cooper",
    type:0,
}
let kMinDuration = 10

const util = require('../../util.js');
const color = require('../../color.js').color;
var app = getApp();

Page({

    data: {
        rangeSelectorT: 0,
        rangeSelectorL: 0,
        rangeSelectorW: 0,
        rangeSelectorH: 0,

        lThumbCenterX: 0,
        rThumbCenterX: 0,
        lThumbStartMovingCenterX: 0,
        rThumbStartMovingCenterX: 0,
        thumbW: 0,
        thumbH: 0,
        movingLThumb: false,
        movingRThumb: false,

        startPosition: {
            x: -1,
            y: -1
        },
        magicColor: '#666666',
        cardT: 0,
        cardL: 0,
        cardW: 0,
        cardH: 0,
        songProgress: 0,
        songToggleButtonImageName: '../../images/card_info_play.png',
        song: {},
        songDuration: 0,
        songUrl: '',
        selectText: '',
        lThumbText: '',
        rThumbText: '',
        lThumbTime: 0,
        rThumbTime: 0,

        playState: 'stop',
        loadingSongUrl: true,
    },

    songToggleButtonDidClick: function() {
        this.playOrPause()
    },

    updateText: function() {
        let duration = this.data.songDuration

        if (duration == undefined) {
            return
        }

        let lRate = (this.data.lThumbCenterX - this.data.rangeSelectorL) / this.data.rangeSelectorW
        let rRate = (this.data.rThumbCenterX - this.data.rangeSelectorL) / this.data.rangeSelectorW
        let lTime = duration * lRate
        let rTime = duration * rRate
        rTime = Math.max(lTime, rTime)
        let lString = this.secondsToString(lTime)
        let rString = this.secondsToString(rTime)

        this.setData({
            lThumbText: lString,
            rThumbText: rString,
            lThumbTime: lTime,
            rThumbTime: rTime,
            selectText: '选中片段 ' + lString + '-' + rString,
        })
    },

    prepareSong: function () {
        if (this.data.song != undefined && this.data.song.mid.length > 0) {
            let backgroundAudioManager = wx.getBackgroundAudioManager();

            backgroundAudioManager.onPause(() => {
                this.setData({
                    playState: 'pause',
                    songToggleButtonImageName: '../../images/card_info_play.png',
                });
            });

            backgroundAudioManager.onStop(() => {
                this.setData({
                    playState: 'stop',
                    songToggleButtonImageName: '../../images/card_info_play.png',
                });
            });

            backgroundAudioManager.onError(() => {
                this.setData({
                    playState: 'error',
                    songToggleButtonImageName: '../../images/card_info_play.png',
                });
            });

            backgroundAudioManager.onPlay(() => {
                this.setData({
                    playState: 'playing',
                    songToggleButtonImageName: '../../images/card_info_pause.png',
                });
            });

            backgroundAudioManager.onTimeUpdate(() => {
                let needUpdateText = false
                if (this.data.songDuration == 0) {
                    needUpdateText = true
                }
                let progress = 0
                if (this.data.rThumbTime - this.data.lThumbTime != 0) {
                    progress = (backgroundAudioManager.currentTime - this.data.lThumbTime) / (this.data.rThumbTime - this.data.lThumbTime)
                }                 
                this.setData({
                    songDuration: (this.data.songDuration == 0 ? backgroundAudioManager.duration : this.data.songDuration),
                    songProgress: progress,
                });
                if (needUpdateText) {
                    this.updateText()
                }
            });

            backgroundAudioManager.onEnded(() => {
                this.setData({
                    playState: 'stop',
                    songToggleButtonImageName: '../../images/card_info_play.png',
                });
            });

            let mid = this.data.song.mid
            let type = this.data.song.type
            let that = this
            util.getSongSrc([mid], [type], (url) => {
                console.log('获取歌曲（mid=', mid, '，type=', type, '）播放URL：', url)
                backgroundAudioManager.title = that.data.song.name || ''
                backgroundAudioManager.singer = that.data.song.singer || ''
                backgroundAudioManager.coverImgUrl = that.data.imageUrl
                backgroundAudioManager.src = url
                that.setData({
                    songUrl: url,
                    loadingSongUrl: false,
                })
                that.updateText()
            });
        }
    },

    playOrPause: function () {
        let backgroundAudioManager = wx.getBackgroundAudioManager()
        if (backgroundAudioManager.src == undefined || backgroundAudioManager.src.length == 0) {
            backgroundAudioManager.src = this.data.songUrl
        }        
        if (!backgroundAudioManager.paused) {
            backgroundAudioManager.pause()
        } else {
            backgroundAudioManager.play()
        }
    },

    seek: function(time) {
        let backgroundAudioManager = wx.getBackgroundAudioManager()
        backgroundAudioManager.seek(time)
        backgroundAudioManager.play()
    },

    pause: function() {
        let backgroundAudioManager = wx.getBackgroundAudioManager()
        if (!backgroundAudioManager.paused) {
            backgroundAudioManager.pause()
        }
    },

    onShow: function (e) {
        let backgroundAudioManager = wx.getBackgroundAudioManager();
        if (this.data.playState != 'playing') {
            // 播放
            // backgroundAudioManager.play();
        }
    },

    onHide: function () {
        let backgroundAudioManager = wx.getBackgroundAudioManager();
        backgroundAudioManager.pause();
    },

    onLoad: function (options) {
        this.setData({
            song: app.globalData.selectedSong,
        })

        let that = this
        wx.getSystemInfo({
            success: function (res) {
                // success
                that.setData({
                    screenHeight: res.windowHeight,
                    screenWidth: res.windowWidth,
                })

            }
        })

        this.setData({
            rangeSelectorT: this.data.screenHeight * 5 / 7,
            rangeSelectorL: kSelectorHorizontalMargin,
            rangeSelectorW: this.data.screenWidth - kSelectorHorizontalMargin * 2,
            rangeSelectorH: 80,
            lThumbCenterX: this.lThumbStartCenterX(),
            rThumbCenterX: this.rThumbStartCenterX(),
            thumbW: 40,
            thumbH: 30,
            cardT: 40,
            cardL: this.data.screenWidth * (1 - 0.64) / 2,
            cardW: this.data.screenWidth * 0.64,
            cardH: this.data.screenWidth * 0.64 * 1.3,
        })

        this.prepareSong()
    },

    touchStart: function (event) {
        var touch = event.touches[0]
        let lDiff = Math.abs(touch.pageX - this.data.lThumbCenterX)
        let rDiff = Math.abs(touch.pageX - this.data.rThumbCenterX)
        var movingL = false
        var movingR = false
        if (lDiff < rDiff) {
            movingL = true
        } else if (lDiff > rDiff) {
            movingR = true
        } else {
            if (touch.pageX <= this.data.lThumbCenterX) {
                movingL = true
            } else {
                movingR = true
            }
        }
        this.setData({
            startPosition: {
                x: touch.pageX,
                y: touch.pageY,
            },
            movingLThumb: movingL,
            movingRThumb: movingR,
            lThumbStartMovingCenterX: this.data.lThumbCenterX,
            rThumbStartMovingCenterX: this.data.rThumbCenterX,
        })
    },

    touchMove: function (event) {
        let pageX = event.touches[0].pageX
        let pageY = event.touches[0].pageY
        let minDis = kMinDuration / this.data.songDuration * (this.data.rangeSelectorW + this.data.rangeSelectorL)
        if (this.data.movingLThumb) {
            let min = this.lThumbStartCenterX()
            let max = this.data.rThumbStartMovingCenterX - minDis
            this.setData({
                lThumbCenterX: Math.min(Math.max(min, this.data.lThumbStartMovingCenterX + pageX - this.data.startPosition.x), max),
            });
            this.pause()
        } else if (this.data.movingRThumb) {
            let min = this.data.lThumbStartMovingCenterX + minDis
            let max = this.rThumbStartCenterX()
            this.setData({                
                rThumbCenterX: Math.min(Math.max(min, this.data.rThumbStartMovingCenterX + pageX - this.data.startPosition.x), max),
            });
        }       
        this.updateText() 
    },

    // 第一张移动结束处理动画
    touchEnd: function (event) {
        this.updateText()
        if (this.data.movingLThumb) {
            this.seek(this.data.lThumbTime)
        } else if (this.data.movingRThumb) {
            let backgroundAudioManager = wx.getBackgroundAudioManager()
            if (backgroundAudioManager.currentTime > this.data.rThumbTime) {
                this.seek(this.data.lThumbTime)
            }
        }
        this.setData({
            movingLThumb: false,
            movingRThumb: false,
        })
    },

    lThumbStartCenterX: function() {
        return kSelectorHorizontalMargin
    },

    rThumbStartCenterX: function () {
        return this.data.screenWidth - kSelectorHorizontalMargin
    },

    secondsToString: function(seconds) {
        seconds = parseInt(seconds)
        let hours = parseInt(seconds / 3600)
        seconds = parseInt(seconds % 3600)
        let minutes = parseInt(seconds / 60)
        seconds = parseInt(seconds % 60)
        if (hours > 0) {
            return hours + ':' + minutes + ':' + (seconds < 10 ? '0' + seconds : seconds)
        } else {
            return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds)
        }
    }
})