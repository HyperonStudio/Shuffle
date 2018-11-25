//index.js
//获取应用实例
var app = getApp();

var allCount=0;




//ALL:假数据,若加载到服务器数据,可将ALL掷为[],在onLoad函数中请求服务器数据赋给ALL;(ps:记得在所有数据后面附上两条假数据,如下ALL中倒数这两条数据,因为这两条数据用于处理层叠效果,若改变其id,在对应的函数处理判断位置应该修改其判断值)
//bug:ALL数据应为奇数条,不然会导致最后层叠效果无法消失
//animationData(动画),want_hidden(点击要,将要隐藏起来),nowant_hidden 初始化对应的数据
Page({
  data: {
    animationData: {},
    want_hidden:false,
    nowant_hidden:true,
    All: [{
      cardUrl: '../../images/test1.jpg',
      id:1
     
    }, {
        cardUrl: '../../images/test2.jpg',
      id:2

    
    }, {
        cardUrl: '../../images/test3.jpg',
      id:3
    },
    
    {
        cardUrl: '../../images/test3.jpg',
      id:4
    },
    
    {
        cardUrl: '../../images/test4.jpg',
      id:5   
    },
    
    {
        cardUrl: '../../images/test5.jpg',
      id:6
    },
    
    ]
  },




  // 滑动第一张的移动事件
  //pageX,pageY,当前移动点位置
  //moveX,moveY用于锁定图片中点位置
  //ballLeft由于是rpx所以*2

  touchmove:function(event) {
    console.log(event)
    let pageX = event.touches[0].pageX;
    let pageY = event.touches[0].pageY;
    // 需要移动的距离;
    let moveX=this.data.screenWidth*0.8*0.5;
    let moveY=350*0.5;
          this.setData ({
            ballTop: event.touches[0].pageY - moveY,
            ballLeft: (event.touches[0].pageX - moveX)*2,
          });   
     
  },


// 第一张移动结束处理动画
  touchend:function(event){
        if(event.currentTarget.offsetLeft<-110){
          this.Animation(-500);
        }else if(event.currentTarget.offsetLeft>180){
          this.Animation(500);
        }else{
          this.AnimationN1(event.currentTarget.offsetLeft,event.currentTarget
    .offsetTop);
        }

  },



//第二张移动事件  
//pageX,pageY,当前移动点位置
   touchmove2:function(event) {
    let pageX = event.touches[0].pageX;
    let pageY = event.touches[0].pageY;
    console.log(pageX,pageY);
    // 需要移动的距离;
    let moveX=this.data.screenWidth*0.8*0.5;
    let moveY=350*0.5;
    this.setData ({
      ballTop2: event.touches[0].pageY - moveY,
      ballLeft2: (event.touches[0].pageX - moveX)*2,
    });
    
  },


// 第二张移动结束处理动画
touchend2:function(event){

    if(event.currentTarget
.offsetLeft<-110){
     
      this.Animation2(-500);

    }else if(event.currentTarget
.offsetLeft>180){
             this.Animation2(500);    
    }else{
      this.AnimationN2(event.currentTarget
.offsetLeft,event.currentTarget
.offsetTop);
    }
      
},

// 第一张左滑动右滑动动画
Animation:function(translateXX){
 
       // 动画
    var animation = wx.createAnimation({
      duration: 720,
      // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
        timingFunction: "ease",

    });
    this.animation= animation;
    this.animation.translateY(0).translateX(translateXX).step();
    this.animation.translateY(0).translateX(0).opacity(1).rotate(0).step({duration: 10});


    
    this.setData({
      animationData: this.animation.export(),

    

    });
    var self=this;
    setTimeout(function(){
        self.setData({
        ballTop:62,
        ballLeft:76,
        index1:4,
        percent2:100,
        index2:6,
        })
    },720);
        setTimeout(function() {
      var cardInfoList = self.data.cardInfoList;
      if(self.data.All.length>0){
        var tempfromAll=self.data.All.shift();
        self.data.cardInfoList[0]=tempfromAll;
        }
  
                  
  //当加载最后一条数据时划出后隐藏自己
            if(self.data.cardInfoList[0].id==allCount){
             
          //   self.setData({
          //       hidden1:true,
              
          // })
               wx.showToast({
                        title: '已无更多',
                        icon: 'success',
                        duration: 2000
                      })   
          
        }

        self.setData({
        cardInfoList: self.data.cardInfoList,
        animationData: {},
      });
    }, 350);

},
// 第二张左滑动右滑动动画
Animation2:function(translateXX){
       // 动画
    var animation = wx.createAnimation({
      duration: 720,
      // timingFunction: 'cubic-bezier(.8,.2,.1,0.8)',
        timingFunction: "ease",

    });
   this.animation= animation;
    this.animation.translateY(0).translateX(translateXX).opacity(0,1).step();
    this.animation.translateY(0).translateX(0).opacity(1).rotate(0).step({duration: 10});


    
    this.setData({
      animationData1: this.animation.export(),
    });


    var self=this;
    setTimeout(function(){
        self.setData({
        percent1:100,
        index1:6, 

        ballTop2:62,
        ballLeft2:76,
        index2:4,
    
        })
    },720)


          setTimeout(function() {
      var cardInfoList = self.data.cardInfoList;
   
      if(self.data.All.length>0){

        var tempfromAll=self.data.All.shift();
        self.data.cardInfoList[1]=tempfromAll;


      } 
  

        self.setData({
        cardInfoList: self.data.cardInfoList,
        animationData: {},

      });
    }, 350);

},


    // 第一张图片不需翻页动画
AnimationN1:function(offsetX,offsetY){
   // 动画
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
        // timingFunction: "ease",

    });
    var self = this;
    this.animation= animation;
   this.animation.translateX(offsetX).translateY(offsetY).rotate(0).step({duration: 10});
    this.animation.translateY(0).translateX(0).rotate(0).scale(1).step();
    
    this.setData({
        animationData: this.animation.export(),
        ballTop:62,
        ballLeft:76,
    });
},


// 第二张图片不需翻页动画
AnimationN2:function(offsetX,offsetY){
   // 动画
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
        // timingFunction: "ease",

    });
    var self = this;
    this.animation= animation;
      this.animation.translateX(offsetX).translateY(offsetY).rotate(0).step({duration: 10});
    this.animation.translateY(0).translateX(0).scale(1).rotate(0).step();
    
    this.setData({
        animationData1: this.animation.export(),
        ballTop2:62,
        ballLeft2:76,
    });
},

 












// 加载数据
//temp从ALL取出的数据
//cardInfoList:temp;将ALL取出的数据放入以供显示
//ballTop、ballLeft     第一张初始图片位置
//ballTop2、ballLeft2   第二张初始图片位置
//index1:6,index2:4,    两张图片初始的z-index
    
onLoad: function () {
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
   allCount=that.data.All.length;
    var temp = new Array();
    for(let i=0;i<2;i++){
      var add=that.data.All.shift();
      temp.push(add);
    }
    
    console.log(that.data.All.length);
    console.log(temp);
    that.setData({
    cardInfoList:temp,  


    ballTop:62,
    ballLeft:76,
    ballTop2:62,
    ballLeft2:76,
    index1:6,
    index2:4,
        
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
}
})




