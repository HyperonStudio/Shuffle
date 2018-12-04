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

        wx.getUserInfo({
            success: function (res) {
                getApp().userInfo = res.userInfo
                console.log('UserInfo: ', res.userInfo)
            }
        })

        Util.login()

        Util.ajax({
            url: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg',
            method: "GET",
            data: {
                format: 'json',
                tpl: 3,
                topid: 4,
                type: 'top',
                platform: 'h5',
                page: 'detail',
                needNewCode: 1,
                song_num: 50
            },
            success: (res) => {
                res = res.data || {};
                if (res.code == 0 && res.songlist && res.songlist.length) {
                    let formattedSongList = res.songlist.map((song) => {
                        return Util.simpleSongInfo(song.data);
                    });
                }
            },
            fail: function(err) {
                Util.tip('拉取热门歌曲失败');
            }
        });
    }
})