// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
    return {
        code: 0,
        data: [{
            author: {
                avatarUrl: 'https://avatars3.githubusercontent.com/u/7379793?s=460&v=4',
                name: 'Viktor'
            },
            song: {
                
            },
            text: '下班的路上，听着这首歌，就有返回公司继续加班的冲动',
            likeCount: 983741,
            picUrl: 'http://imgsrc.baidu.com/imgad/pic/item/9922720e0cf3d7ca7533225ef91fbe096a63a9d4.jpg',
        }, ]
    }
}