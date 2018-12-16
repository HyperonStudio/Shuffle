// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const _ = db.command
    let history = event.historyid
    console.log(history)
    return db.collection('CardInfo').where({
        _id: _.nin(history)
    }).orderBy('time', 'desc').get()
}