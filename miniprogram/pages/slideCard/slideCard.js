//index.js
//获取应用实例

var app = getApp();

var allCount = 0;

let SwipeOutAnimationDuration = 300;
let BackToCenterAnimationDuration = 300;
let MinSwipeDistance = 150;
let CardTopDistance = 10;
let CardScaleRate = 0.95;

//ALL:假数据,若加载到服务器数据,可将ALL掷为[],在onLoad函数中请求服务器数据赋给ALL;(ps:记得在所有数据后面附上两条假数据,如下ALL中倒数这两条数据,因为这两条数据用于处理层叠效果,若改变其id,在对应的函数处理判断位置应该修改其判断值)
//bug:ALL数据应为奇数条,不然会导致最后层叠效果无法消失
//animationData(动画),want_hidden(点击要,将要隐藏起来),nowant_hidden 初始化对应的数据
Page({
    data: {
        currentCardL: 0,
        currentCardT: 0,
        currentCardW: 0,
        currentCardH: 0,
        currentCardAnimation: {},

        middleCardL: 0,
        middleCardL: 0,
        middleCardW: 0,
        middleCardH: 0,
        middleCardScaleW: 1,
        middleCardScaleH: 1,
        middleCardAnimation: {},

        lastCardL: 0,
        lastCardL: 0,
        lastCardW: 0,
        lastCardH: 0,
        lastCardAnimation: {},
        lastCardOpacity: 1,
        
        want_hidden: false,
        nowant_hidden: true,
        startPosition: {x:-1,y:-1},
        All: [{
                imageUrl: '../../images/loocup_cover_0.jpeg',
                songName: '氧气',
                singerName: '郝蕾',
                desc: '所有的光芒都向我涌来，所有的氧气都被我吸光，所有的物体都失去重量......',
                posterName: '东莞吴彦祖',
                posterAvatarUrl: 'https://avatars3.githubusercontent.com/u/7379793?s=460&v=4',
                liked: 0,
            }, 
            {
                imageUrl: '../../images/loocup_cover_1.png',
                songName: '缺氧',
                singerName: '郝雷',
                desc: '所有的光芒都向我涌来，所有的氧气都被我吸光，所有的物体都失去重量......',
                posterName: '东莞吴彦祖',
                posterAvatarUrl: 'https://avatars3.githubusercontent.com/u/7379793?s=460&v=4',
                liked: 0,
            }, 
            {
                imageUrl: '../../images/loocup_cover_2.jpeg',
                songName: '臭氧',
                singerName: '郝雨',
                desc: '所有的光芒都向我涌来，所有的氧气都被我吸光，所有的物体都失去重量......',
                posterName: '东莞吴彦祖',
                posterAvatarUrl: 'https://avatars3.githubusercontent.com/u/7379793?s=460&v=4',
                liked: 0,
            },
            {
                imageUrl: '../../images/loocup_cover_3.jpeg',
                songName: '供氧',
                singerName: '郝雪',
                desc: '所有的光芒都向我涌来，所有的氧气都被我吸光，所有的物体都失去重量......',
                posterName: '东莞吴彦祖',
                posterAvatarUrl: 'https://avatars3.githubusercontent.com/u/7379793?s=460&v=4',
                liked: 0,
            },
            {
                imageUrl: '../../images/loocup_cover_4.jpeg',
                songName: '厌氧菌',
                singerName: '郝雾',
                desc: '所有的光芒都向我涌来，所有的氧气都被我吸光，所有的物体都失去重量......',
                posterName: '东莞吴彦祖',
                posterAvatarUrl: 'https://avatars3.githubusercontent.com/u/7379793?s=460&v=4',
                liked: 0,
            },
            {
                imageUrl: '../../images/loocup_cover_5.jpeg',
                songName: '氧气罩',
                singerName: '郝霾',
                desc: '所有的光芒都向我涌来，所有的氧气都被我吸光，所有的物体都失去重量......',
                posterName: '东莞吴彦祖',
                posterAvatarUrl: 'https://avatars3.githubusercontent.com/u/7379793?s=460&v=4',
                liked: 0,
            },
        ]
    },

    touchStart: function(event) {
        var touch = event.touches[0]
        this.setData({
            startPosition: {x: touch.pageX, y: touch.pageY},
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
        let x = event.currentTarget.offsetLeft - this.currentCardStartL()
        let y = event.currentTarget.offsetTop - this.currentCardStartT()
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
        middleCardAnimation.left(this.currentCardStartL()).top(this.currentCardStartT()).scaleX(1).scaleY(1).step()

        var lastCardAnimation = wx.createAnimation({
            duration: SwipeOutAnimationDuration,
            timingFunction: "ease",
        })
        lastCardAnimation.left(this.middleCardStartL()).top(this.middleCardStartT()).scaleX(CardScaleRate).scaleY(CardScaleRate).step()

        this.setData({
            currentCardAnimation: currentCardAnimation.export(),
            middleCardAnimation: middleCardAnimation.export(),
            lastCardAnimation: lastCardAnimation.export(),
        });

        // 动画之后，改变数据源
        var that = this;
        setTimeout(function () {
            var cardInfoList = that.data.cardInfoList;
            cardInfoList.shift();            
            if (that.data.All.length > 0) {
                var lastCardInfo = that.data.All.shift();
                cardInfoList.push(lastCardInfo)                
            } else {
                wx.showToast({
                    title: '已无更多',
                    icon: 'success',
                    duration: 2000
                })
            }
            that.resetCardPositions(cardInfoList)
            
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
        setTimeout(function () {
            that.setData({
                currentCardAnimation: {},
            })
        }, BackToCenterAnimationDuration);
    },

    // 加载数据
    //temp从ALL取出的数据
    //cardInfoList:temp;将ALL取出的数据放入以供显示
    //ballTop、ballLeft     第一张初始图片位置
    //ballTop2、ballLeft2   第二张初始图片位置
    //index1:6,index2:4,    两张图片初始的z-index

    onLoad: function() {
        var that = this;

        // 请求服务器数据
        // wx.request({
        //   url: 'https://service.woyao.huoxingwan.com',
        //   data: {},
        //   method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        //   // header: {}, // 设置请求的 header
        //   success: function(res){
        //     // success
        //     console.log(res+"222");
        //     // that.setData({
        //       // All:res中的数组资源
        //     // })
        //   },
        //   fail: function(res) {
        //     // fail
        //   },
        //   complete: function(res) {
        //     // complete
        //   }
        // })




        //调用应用实例的方法获取全局数据
        // 创建一个临时数组 ,用于加载值(2个)
        allCount = that.data.All.length;
        var temp = new Array();
        for (let i = 0; i < 3; i++) {
            var add = that.data.All.shift();
            temp.push(add);
        }
        that.setData({
            cardInfoList: temp,


            ballTop: 62,
            ballLeft: 76,
            ballTop2: 62,
            ballLeft2: 76,
            index1: 6,
            index2: 4,

        })

        wx.getSystemInfo({
            success: function(res) {
                // success
                that.setData({
                    screenHeight: res.windowHeight,
                    screenWidth: res.windowWidth,
                })

            }
        })

        this.resetCardPositions(this.data.cardInfoList)
    },

    resetCardPositions: function (cardInfoList) {
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

    currentCardStartL : function() {
        return this.data.screenWidth * 0.08;
    },

    currentCardStartT: function () {
        return this.data.screenHeight * 0.05;
    },

    currentCardStartW: function () {
        return this.data.screenWidth * 0.84;
    },

    currentCardStartH: function () {
        return this.data.screenHeight * 0.84;
    },

    middleCardStartL: function () {
        return this.currentCardStartL();
    },

    middleCardStartT: function () {
        let heightDiff = this.currentCardStartH() * (1 - CardScaleRate) / 2;
        return this.currentCardStartT() - heightDiff - CardTopDistance;
    },

    middleCardStartW: function () {
        return this.currentCardStartW();
    },

    middleCardStartH: function () {
        return this.currentCardStartH();
    },

    lastCardStartL: function () {
        return this.currentCardStartL();
    },

    lastCardStartT: function () {
        let heightDiff = this.currentCardStartH() * (1 - CardScaleRate * CardScaleRate) / 2;
        return this.currentCardStartT() - heightDiff - CardTopDistance * 2;
    },

    lastCardStartW: function () {
        return this.currentCardStartW();
    },

    lastCardStartH: function () {
        return this.currentCardStartH();
    },
})