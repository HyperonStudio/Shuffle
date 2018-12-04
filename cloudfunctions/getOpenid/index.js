const cloud = require('wx-server-sdk')
cloud.init()

exports.main = (event, context) => {
    return {
        openid: event.userInfo.openId,
    }
}