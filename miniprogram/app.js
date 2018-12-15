//app.js

import * as Util from './util.js';

App({
    onLaunch: function() {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                traceUser: true,
            })
        }

        this.globalData = {}

        wx.cloud.callFunction({
            name: 'getOpenid',
            data: {

            },
            success: function (res) {
                getApp().globalData.openid = res.result.openid
                console.log('getOpenID:' + getApp().globalData.openid)
            },
            fail: console.error
        })
    }
})