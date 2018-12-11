//index.js
//获取应用实例

const util = require('../../util.js');

var app = getApp();

var allCount = 0;

let SwipeOutAnimationDuration = 300;
let BackToCenterAnimationDuration = 300;
let MinSwipeDistance = 150;
let CardTopDistance = 10;
let CardScaleRate = 0.95;

Page({
    data: {
        currentCardL: 0,
        currentCardT: 0,
        currentCardW: 0,
        currentCardH: 0,
        currentCardA: 1,        
        currentCardAnimation: {},

        middleCardL: 0,
        middleCardL: 0,
        middleCardW: 0,
        middleCardH: 0,
        middleCardA: 0.2,
        middleCardScaleW: 1,
        middleCardScaleH: 1,
        middleCardAnimation: {},

        lastCardL: 0,
        lastCardL: 0,
        lastCardW: 0,
        lastCardH: 0,
        lastCardA: 0.1,
        lastCardAnimation: {},
        lastCardOpacity: 1,

        playState: 'stop',
        curPlayMid: '',
        songProgress: 0,
        songToggleButtonImageName: '../../images/card_info_play.png',

        startPosition: {
            x: -1,
            y: -1
        },

        allCardInfos: [],
        loadingText: '加载中...',
        loadingTextHidden: false,
    },

    posterDidTap: function(e) {
        let card = e.currentTarget.dataset.card
        let user = card.poster
        wx.navigateTo({
            url: '../userPage/userPage?user=' + JSON.stringify(user) + '&openId=' + card.openid,
        })
    },

    songToggleButtonDidClick: function(e) {
        this.playOrPause()
    },

    myCardButtonDidClick: function(e) {
        wx.navigateTo({
            url: '../userPage/userPage?user=' + JSON.stringify(app.userInfo) + '&openId=' + app.globalData.openid,
        })
    },

    postButtonDidClick: function(e) {
        wx.navigateTo({
            url: '../postCard/postCard',
        })
    },

    likeDidTap: function(e) {
        let card = e.currentTarget.dataset.card
        if (card.likedUserIDs.indexOf(app.globalData.openid) > -1) {
            let that = this
            wx.cloud.callFunction({
                name: 'updateLikeCard',
                data: {
                    userID: app.globalData.openid,
                    card: card,
                    liked: false,
                },
                success: function(res) {
                    console.log('Update unlike:', res)
                    if (res.result.stats.updated == 1) {
                        wx.showToast({
                            title: '已取消收藏',
                            icon: 'success',
                            duration: 1000
                        })
                        that.updateCardInfoLikeStats(card, false)
                        that.resetCardPositions(that.data.cardInfoList)
                    }
                },
                fail: console.error
            })
        } else {
            let that = this
            wx.cloud.callFunction({
                name: 'updateLikeCard',
                data: {
                    userID: app.globalData.openid,
                    card: card,
                    liked: true,
                },
                success: function(res) {
                    console.log('Update like:', res)
                    if (res.result.stats.updated == 1) {
                        wx.showToast({
                            title: '已收藏',
                            icon: 'success',
                            duration: 1000
                        })
                        that.updateCardInfoLikeStats(card, true)
                        that.resetCardPositions(that.data.cardInfoList)
                    }
                },
                fail: console.error
            })
        }
    },

    updateCardInfoLikeStats(card, liked) {
        if (liked) {
            for (var i = 0; i < this.data.allCardInfos.length; i++) {
                if (this.data.allCardInfos[i]._id == card._id) {
                    this.data.allCardInfos[i]['likedUrl'] = ('../../images/card_info_liked.png')
                    this.data.allCardInfos[i].likedUserIDs.push(app.globalData.openid)
                    break
                }
            }
            for (var i = 0; i < this.data.cardInfoList.length; i++) {
                if (this.data.cardInfoList[i]._id == card._id) {
                    this.data.cardInfoList[i]['likedUrl'] = ('../../images/card_info_liked.png')
                    this.data.cardInfoList[i].likedUserIDs.push(app.globalData.openid)
                    break
                }
            }
        } else {
            for (var i = 0; i < this.data.allCardInfos.length; i++) {
                if (this.data.allCardInfos[i]._id == card._id) {
                    this.data.allCardInfos[i]['likedUrl'] = ('../../images/card_info_like.png')
                    this.data.allCardInfos[i].likedUserIDs = this.arrayWithout(this.data.allCardInfos[i].likedUserIDs, app.globalData.openid)
                    break
                }
            }
            for (var i = 0; i < this.data.cardInfoList.length; i++) {
                if (this.data.cardInfoList[i]._id == card._id) {
                    this.data.cardInfoList[i]['likedUrl'] = ('../../images/card_info_like.png')
                    this.data.cardInfoList[i].likedUserIDs = this.arrayWithout(this.data.cardInfoList[i].likedUserIDs, app.globalData.openid)
                    break
                }
            }
        }
    },

    arrayWithout: function(array, target) {
        var newArray = []
        for (var i = 0; i < array.length; i++) {
            if (target != array[i]) {
                newArray.push(array[i])
            }
        }
        return newArray
    },

    playOrPause: function() {
        let backgroundAudioManager = wx.getBackgroundAudioManager();
        if (!backgroundAudioManager.paused) {
            backgroundAudioManager.pause()
        } else {
            backgroundAudioManager.play()
        }
    },

    playFirstCardSong: function() {
        if (this.data.cardInfoList.length > 0) {
            let backgroundAudioManager = wx.getBackgroundAudioManager();

            if (this.data.playState == 'playing' && this.data.curPlayMid == mid) {
                // 暂停
                backgroundAudioManager.pause();
                return;
            }

            if (this.data.curPlayMid == mid) {
                // 续播
                backgroundAudioManager.play();
                return;
            }

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
                this.setData({
                    songProgress: backgroundAudioManager.currentTime / backgroundAudioManager.duration
                });
            });

            backgroundAudioManager.onEnded(() => {
                this.animateSwipeOutCurrentCard(0, -this.data.screenHeight)
            });

            let cardInfo = this.data.cardInfoList[0]
            let mid = cardInfo.song.mid
            let type = cardInfo.song.type
            util.getSongSrc([mid], [type], (url) => {
                console.log('获取歌曲（mid=', mid, '，type=', type, '）播放URL：', url)
                backgroundAudioManager.title = cardInfo.song.name || ''
                backgroundAudioManager.singer = cardInfo.song.singer || ''
                backgroundAudioManager.coverImgUrl = cardInfo.imageUrl
                backgroundAudioManager.src = url
                this.setData({
                    curPlayMid: mid
                })
                backgroundAudioManager.play()
                setTimeout(function() {
                    backgroundAudioManager.seek(backgroundAudioManager.duration - 10)
                }, 1000)
                
            });
        }
    },

    queryCardInfos: function() {
        let that = this
        wx.cloud.callFunction({
            name: 'queryCardInfo',
            data: {

            },
            success: function(res) {
                console.log('Query CardInfos:', res)
                if (res.result.data.length > 0) {
                    that.setData({
                        allCardInfos: res.result.data,
                        loadingTextHidden: true,
                    })
                    that.prepareDatas()
                    that.reloadData()
                } else {
                    that.setData({
                        loadingText: '没有卡片！',
                        loadingTextHidden: false,
                    })
                }
            },
            fail: function(err) {
                console.log('Query CardInfos:', err)
                that.setData({
                    loadingText: '加载失败',
                    loadingTextHidden: true,
                })
            }
        })
    },

    prepareDatas: function() {
        for (var i = 0; i < this.data.allCardInfos.length; i++) {
            var cardInfo = this.data.allCardInfos[i]
            cardInfo['likedUrl'] = (cardInfo.likedUserIDs.indexOf(app.globalData.openid) > -1 ? '../../images/card_info_liked.png' : '../../images/card_info_like.png')
            cardInfo['unique'] = Math.floor((Math.random() * 100000)) + 1
        }
    },

    reloadData: function() {
        var cardInfoList = new Array();
        var count = this.data.allCardInfos.length
        for (var i = 0; i < 3; i++) {
            let card = this.data.allCardInfos.shift();
            cardInfoList.push(card);
            count--
            if (count == 0) break;
        }
        this.resetCardPositions(cardInfoList)
        this.playFirstCardSong()
    },

    onLoad: function(option) {
        let that = this
        wx.getSystemInfo({
            success: function(res) {
                // success
                that.setData({
                    screenHeight: res.windowHeight,
                    screenWidth: res.windowWidth,
                })

            }
        })

        if (option.cardData) {
            var array = JSON.parse(option.cardData)
            let length = array.length
            if (length > 0) {
                let before = array.slice(0, option.index);
                let after = array.slice(option.index, length);
                this.setData({
                    allCardInfos: after.concat(before)
                })
                this.prepareDatas()
                this.reloadData()

            }
        } else {
            this.queryCardInfos()
        }
    },

    resetCardPositions: function(cardInfoList) {
        var currentCardAnimation = wx.createAnimation({
            duration: 0,
        });
        currentCardAnimation.translateX(0).translateY(0).step();

        var middleCardAnimation = wx.createAnimation({
            duration: 0,
        })
        middleCardAnimation.scaleX(CardScaleRate).scaleY(CardScaleRate).step()

        var lastCardAnimation = wx.createAnimation({
            duration: 0,
        })
        lastCardAnimation.scaleX(CardScaleRate * CardScaleRate).scaleY(CardScaleRate * CardScaleRate).step()

        this.setData({
            cardInfoList: cardInfoList,
            currentCardL: this.currentCardStartL(),
            currentCardT: this.currentCardStartT(),
            currentCardW: this.currentCardStartW(),
            currentCardH: this.currentCardStartH(),
            currentCardAnimation: currentCardAnimation.export(),
            middleCardL: this.middleCardStartL(),
            middleCardT: this.middleCardStartT(),
            middleCardW: this.middleCardStartW(),
            middleCardH: this.middleCardStartH(),
            middleCardAnimation: middleCardAnimation.export(),
            lastCardL: this.lastCardStartL(),
            lastCardT: this.lastCardStartT(),
            lastCardW: this.lastCardStartW(),
            lastCardH: this.lastCardStartH(),
            lastCardAnimation: lastCardAnimation.export(),
        })
    },

    currentCardStartL: function() {
        return this.data.screenWidth * 0.08;
    },

    currentCardStartT: function() {
        return this.data.screenHeight * 0.05;
    },

    currentCardStartW: function() {
        return this.data.screenWidth * 0.84;
    },

    currentCardStartH: function() {
        return this.data.screenHeight * 0.84;
    },

    middleCardStartL: function() {
        return this.currentCardStartL();
    },

    middleCardStartT: function() {
        let heightDiff = this.currentCardStartH() * (1 - CardScaleRate) / 2;
        return this.currentCardStartT() - heightDiff - CardTopDistance;
    },

    middleCardStartW: function() {
        return this.currentCardStartW();
    },

    middleCardStartH: function() {
        return this.currentCardStartH();
    },

    lastCardStartL: function() {
        return this.currentCardStartL();
    },

    lastCardStartT: function() {
        let heightDiff = this.currentCardStartH() * (1 - CardScaleRate * CardScaleRate) / 2;
        return this.currentCardStartT() - heightDiff - CardTopDistance * 2;
    },

    lastCardStartW: function() {
        return this.currentCardStartW();
    },

    lastCardStartH: function() {
        return this.currentCardStartH();
    },

    touchStart: function(event) {
        var touch = event.touches[0]
        this.setData({
            startPosition: {
                x: touch.pageX,
                y: touch.pageY
            },
        })
    },

    touchMove: function(event) {
        let pageX = event.touches[0].pageX
        let pageY = event.touches[0].pageY
        this.setData({
            currentCardL: this.currentCardStartL() + pageX - this.data.startPosition.x,
            currentCardT: this.currentCardStartT() + pageY - this.data.startPosition.y,
        });
    },


    // 第一张移动结束处理动画
    touchEnd: function(event) {
        let x = this.data.currentCardL - this.currentCardStartL()
        let y = this.data.currentCardT - this.currentCardStartT()

        if (x == 0 
            && y == 0
            && this.currentCardStartL() + this.currentCardStartW() - 60 <= this.data.startPosition.x
            && this.data.startPosition.x <= this.currentCardStartL() + this.currentCardStartW()
            && this.currentCardStartT() + this.currentCardStartW() - 64 <= this.data.startPosition.y
            && this.data.startPosition.y <= this.currentCardStartT() + this.currentCardStartW()) {
            this.songToggleButtonDidClick()
            return;
        }

        if (x == 0
            && y == 0
            && this.currentCardStartL() + this.currentCardStartW() - 60 <= this.data.startPosition.x
            && this.data.startPosition.x <= this.currentCardStartL() + this.currentCardStartW()
            && this.currentCardStartT() + this.currentCardStartW() - 64 <= this.data.startPosition.y
            && this.data.startPosition.y <= this.currentCardStartT() + this.currentCardStartW()) {
            this.songToggleButtonDidClick()
            return;
        }

        if (Math.abs(x) >= MinSwipeDistance || Math.abs(y) >= MinSwipeDistance) {
            this.animateSwipeOutCurrentCard(x * 3, y * 3)
        } else {
            this.animateCurrentCardBackToCenter(event.currentTarget.offsetLeft, event.currentTarget.offsetTop)
        }
    },

    animateSwipeOutCurrentCard: function(offsetX, offsetY) {
        var currentCardAnimation = wx.createAnimation({
            duration: SwipeOutAnimationDuration,
            timingFunction: "ease",
        });
        currentCardAnimation.translateX(offsetX).translateY(offsetY).step();

        var middleCardAnimation = wx.createAnimation({
            duration: SwipeOutAnimationDuration,
            timingFunction: "ease",
        })
        middleCardAnimation.left(this.currentCardStartL()).top(this.currentCardStartT()).scaleX(1).scaleY(1).opacity(1).step()

        var lastCardAnimation = wx.createAnimation({
            duration: SwipeOutAnimationDuration,
            timingFunction: "ease",
        })
        lastCardAnimation.left(this.middleCardStartL()).top(this.middleCardStartT()).scaleX(CardScaleRate).scaleY(CardScaleRate).opacity(0.2).step()

        this.setData({
            currentCardAnimation: currentCardAnimation.export(),
            middleCardAnimation: middleCardAnimation.export(),
            lastCardAnimation: lastCardAnimation.export(),
        });

        // 动画之后，改变数据源
        var that = this;
        setTimeout(function() {
            var cardInfoList = that.data.cardInfoList
            let removedCardInfo = cardInfoList.shift()
            that.data.allCardInfos.push(removedCardInfo)
            if (that.data.allCardInfos.length > 0) {
                var lastCardInfo = that.data.allCardInfos.shift();
                cardInfoList.push(lastCardInfo)
            } else {
                wx.showToast({
                    title: '已无更多',
                    icon: 'success',
                    duration: 2000
                })
            }
            that.resetCardPositions(cardInfoList)
            that.playFirstCardSong()

            // 最后一张卡片出来的时候，往往会因为加载图片而闪一下，我们要做个渐显动画
            // var lastCardShowAnimation = wx.createAnimation({
            //     duration: 1000,
            //     timingFunction: "ease",
            // })
            // lastCardShowAnimation.opacity(1)
            // that.setData({
            //     lastCardAnimation: lastCardShowAnimation.export(),
            //     lastCardOpacity: 1,
            // });

        }, SwipeOutAnimationDuration);
    },

    animateCurrentCardBackToCenter: function(offsetX, offsetY) {
        var animation = wx.createAnimation({
            duration: BackToCenterAnimationDuration,
            timingFunction: 'ease',
        });
        animation.left(this.currentCardStartL()).top(this.currentCardStartT()).translateX(0).translateY(0).step();

        this.setData({
            // currentCardAnimation: animation.export(),
            currentCardL: this.currentCardStartL(),
            currentCardT: this.currentCardStartT(),
        });
        var that = this
        setTimeout(function() {
            that.setData({
                currentCardAnimation: {},
            })
        }, BackToCenterAnimationDuration);
    },
})