var SPD = {
    _timing: {},
    _start: Date.now(),
    mark: function(a, b) {
        this._timing[a] = (b || Date.now()) - this._start
    }
}

function SPDMark(name, time) {
    if (!SPD._timing[name]) {
        SPD._timing[name] = (time || Date.now()) - SPD._start;
    }
}

function SPDInit() {
    SPD._start = Date.now();
}

function SPDSend(t) {
    var times = t || SPD._timing;
    var params = [];
    for (var key in times) {
        params.push(key + '=' + times[key]);
    }
    if (params) {
        wx.request({
            url: 'https://report.huatuo.qq.com/report.cgi',
            data: {
                appid: 10013,
                speedparams: ['flag1=1648', 'flag2=1', 'flag3=97'].join('&') + '&' + params.join('&'),
                platform: wx.getStorageSync('os')
            },
            method: "GET",
            complete: function() {
                if (!times) {
                    SPD._timing = {}; //上报之后 清空
                }
            }
        });

    }
}

/**
 * @method getLoginfo
 * @desc 获取微信登录信息
 */

function getLoginfo() {
    var music_uin = wx.getStorageSync("music_uin");
    var music_key = wx.getStorageSync("music_key");
    var openid = wx.getStorageSync("openid");
    var g_tk = getACSRFToken(music_key);
    if (music_uin && music_key && openid) {
        return {
            music_uin: music_uin,
            music_key: music_key,
            openid: openid,
            g_tk: g_tk
        };
    } else {
        return false;
    }
}

function getACSRFToken(key) {
    var skey = wx.getStorageSync(key);
    var hash = 5381;
    if (skey) {
        for (var i = 0, len = skey.length; i < len; ++i) {
            hash += (hash << 5) + skey.charCodeAt(i);
        }
    }
    return hash & 0x7fffffff;
};

/** 
 * @method login
 * @desc 获取微信登录
 * @param  {Function}
 */
function login(cb) {
    wx.login({
        success: function(res) {
            var code = res.code; //用户code
            //获取小程序登录态music_key、music_uin和openid
            SPDMark(29); // 获取到微信code
            var _login = function(userData, needUpdateUserInfo) {
                SPDMark(30); // 获取到微信userinfo
                var data = {
                    code: code,
                    encryptData: userData.encryptedData,
                    iv: userData.iv,
                    signature: userData.signature,
                    rawData: userData.rawData,
                  appid: 'wx2e7dd58b0fcdf06d'
                };
                var opt = {
                    url: 'https://c.y.qq.com/base/fcgi-bin/mina_wx_login.fcg',
                    _startTime: new Date().valueOf(),
                    method: 'post',
                    success: function(res) {
                        SPDMark(31); // mina_wx_login cgi返回
                        if (res && res.data && res.data.code == 0) {
                            wx.setStorageSync("music_uin", res.data.music_uin);
                            wx.setStorageSync("music_key", res.data.music_key);
                            wx.setStorageSync("openid", res.data.openid);
                            typeof cb == "function" && cb();
                        }
                    },
                    fail: function(res) {
                        wx.showToast({
                            title: '登录换key失败，稍后重试！',
                            icon: 'loading',
                            duration: 10000
                        })
                    }
                }

                request(opt, data);

                if (needUpdateUserInfo) {
                    setTimeout(function() {
                        wx.getUserInfo({
                            withCredentials: true,
                            success: function(userData) {

                                wx.setStorageSync("userData", userData);
                                wx.setStorageSync("userinfo", userData.userInfo);
                            }
                        });
                    }, 5000);
                }
            };

            wx.getUserInfo({
                withCredentials: true,
                success: function(userData) {
                    wx.setStorageSync("userData", userData);
                    wx.setStorageSync("userinfo", userData.userInfo);
                    _login(userData, 0);
                },
                fail: function() {
                    wx.showToast({
                        title: '获取微信登录信息失败，请退出小程序，重新进入',
                        icon: 'loading',
                        duration: 10000
                    })
                }
            });
        },
        fail: function() {
            wx.showToast({
                title: '登录失败，请重新登录',
                icon: 'loading',
                duration: 10000
            })
        }
    });
}

function ajax(opt) {
    var loginInfo = getLoginfo();
    doAjax(opt, loginInfo || {});
}

function request(opt, data) {
    var time = 1;
    var code, area = '';
    opt.totalStartTime = Date.now();

    function _report() {
        if (opt.noReport) {
            return;
        }
        wx.getSystemInfo({ //cgi失败上报
            success: function(res) {
                var statData = {
                    pid: 7,
                    os: wx.getStorageSync('os'),
                    cgi: ("" + opt.url).split('?')[0],
                    code: opt.code,
                    time: opt.time,
                    area: area,
                    totalTime: opt.endTime - opt.totalStartTime,
                    rate: 1
                };
                (opt.code_sz != undefined) && (statData.code_sz = opt.code_sz);
                (opt.code_sh != undefined) && (statData.code_sh = opt.code_sh);
                (opt.time_sz != undefined) && (statData.time_sz = opt.time_sz);
                (opt.time_sh != undefined) && (statData.time_sh = opt.time_sh);

                var systemInfo = res.system.split(' ')[0];
                setTimeout(function() {
                    wx.request({
                        url: 'https://stat.y.qq.com/ext/fcgi-bin/fcg_web_access_stat.fcg',
                        data: statData,
                        method: "GET",
                        complete: function() {}
                    })
                }, 1000)
            }
        });
    }

    function _request() {
        opt.requestStartTime = Date.now();
        wx.request({
            url: opt.url,
            data: data,
            method: opt.method || "GET",
            success: function(res) {
                opt.endTime = Date.now();

                if (res.statusCode == 200) {
                    if (res.data && res.data.code == 0 || typeof res.data == "string") {
                        opt.needretry = 0;
                        typeof opt.success == "function" && opt.success(res);
                    } else {
                        opt.needretry = 1;
                    }
                } else {
                    opt.needretry = 1;
                }
            },
            fail: function(res) {
                opt.endTime = Date.now();

                opt.needretry = 1;
            },
            complete: function(res) {
                if (res.data) {
                    if (typeof res.data == 'string') {
                        var str = res.data.split('code":')[1];
                        code = str && parseInt(str.split(',')[0]);
                    } else {
                        code = res.data.code;
                    }
                } else {
                    code = res.statusCode;
                }

                if (area == 'sz' || area == 'sh') {
                    opt['code_' + area] = code;
                    opt['time_' + area] = opt.endTime - opt.requestStartTime;
                }

                opt['code'] = code;
                opt['time'] = opt.endTime - opt.requestStartTime;


                if (opt.needretry) {
                    if (time == 1) {
                        if (opt.url.indexOf('c.y.qq.com') != -1) {
                            opt.url = opt.url.replace('c.y.qq.com', 'szc.y.qq.com'); //优先使用深圳
                            time += 1;
                            area = 'sz';
                            _request();
                        }
                    } else if (time == 2) {
                        if (opt.url.indexOf('szc.y.qq.com') != -1) {
                            opt.url = opt.url.replace('szc.y.qq.com', 'shc.y.qq.com'); //使用上海
                            time += 1
                            area = 'sh'
                            _request();
                        }
                    } else {
                        // wx.showToast({
                        //     title: '请求处理失败，请稍后再试！code：' + res.statusCode + ',' + opt.url,
                        //     icon: 'loading',
                        //     duration: 10000
                        // });
                        _report();
                        return;
                    }
                } else {
                    _report();
                }
            }
        });
    }
    _request();

}

function doAjax(opt, loginInfo) {
    var data = {
        mina: 1,
        dirid: 201,
        new_format: 1,
        music_uin: loginInfo.music_uin || 0,
        uin: loginInfo.music_uin || 0,
        music_key: loginInfo.music_key || 0,
        wxopenid: loginInfo.openid || 0,
        g_tk: loginInfo.g_tk || 0
    };
    opt._startTime = new Date().valueOf();
    for (var key in opt.data) {
        data[key] = opt.data[key];
    }
    request(opt, data)
}

/**
 * @method getPic
 * @desc 获取专辑,歌手图片
 * @param {string} type 图片类型: album或singer
 * @param {string} mid  字符串mid 或者 数字id  注意:优先使用mid, 数字id是要废弃的
 * @param {string} size  图片尺寸 默认:68  可选:68,90,150,300,500  注意: 部分尺寸图片可能不存在 ,尤其是数字id拼接的
 * @return 图片地址
 */
function getPic(type, mid, size) {
    var url = 'https://y.gtimg.cn/mediastyle/music_v11/extra/default_300x300.jpg?max_age=31536000';
    if (typeof mid == 'string' && mid.length >= 14) { //字符串mid 走photo_new新逻辑
        type = (type == 'album' ? 'T002' : (type == 'singer' ? 'T001' : type));
        url = 'https://y.gtimg.cn/music/photo_new/' + type + 'R' + (size || 68) + 'x' + (size || 68) + 'M000' + mid + '.jpg?max_age=2592000';
    } else if (mid > 0) { //数字id
        url = 'https://y.gtimg.cn/music/photo/' + type + '_' + (size || 68) + '/' + (mid % 100) + '/' + (size || 68) + '_' + type + 'pic_' + mid + '_0.jpg?max_age=2592000';
    }
    return url;
};

function getSongSrc(mids, types, cb) {
    var guid = wx.getStorageSync('pgv_pvid');
    if (!guid) {
        guid = (new Date()).getUTCMilliseconds();
        guid = "" + (Math.round(Math.random() * 2147483647) * guid) % 10000000000;
        wx.setStorageSync('pgv_pvid', guid);
    };
    var data = {
        "module": "vkey.GetVkeyServer",
        "method": "CgiGetVkey",
        "param": {
            "guid": guid,
            "songmid": mids,
            "songtype": types,
            "uin": "" + wx.getStorageSync("music_uin"),
            "loginflag": 1,
            "platform": "23",
            "h5to": "miniprogram.radio"
        }
    };
    ajax({
        type: 'get',
        url: "https://u.y.qq.com/cgi-bin/musicu.fcg",
        dataType: 'json',
        data: {
            data: JSON.stringify({
                url_mid: data
            })
        },
        withCredentials: true,
        success: function(r) {
            r = r.data;
            if (r.code == 0 && r.url_mid && r.url_mid.code == 0 && r.url_mid.data.midurlinfo) {
                r = r.url_mid.data;
                if (r.midurlinfo.length) {
                    let item = r.midurlinfo[0];
                    let thirdip = r.thirdip && r.thirdip[0] ? r.thirdip[0] : "http://dl.stream.qqmusic.qq.com/";
                    if (item) {
                        let url = item.purl;
                        if (url && !/^https?:\/\//i.test(url)) {
                            url = thirdip + url;
                        }
                        cb && cb(url);
                    }
                }
            } else {
                wx.showToast({
                    title: '获取播放链接失败',
                    duration: 1000
                });
            }
        },
        fail: function() {
            wx.showToast({
                title: '获取播放链接失败',
                duration: 1000
            });
        }
    });
};

function getSystemInfo(cb) {
    wx.getSystemInfo({
        success: function(res) {
            var isMiniheight = false;
            var isMiniWidth = false;
            if (res.windowHeight < 480) {
                isMiniheight = true;
            }
            if (res.windowWidth < 360) {
                isMiniWidth = true;
            }
            cb && cb(isMiniheight, isMiniWidth)
        }
    })
}

function formatSong(songdata) {
    if (songdata) {
        let songSwitch = songdata['switch'] || (songdata.action && songdata.action.switch) || 0;
        
        if (songSwitch == 0 && songdata.type != 0) {
            songSwitch = 403;
        }

        let actionKeys = [
            '', // 第一位置空
            'play_lq',  // 01 普通音质播放权限位 （0：不可以播放 1：可以播放）
            'play_hq',  // 02 HQ音质播放权限位 （0：不可以播放 1：可以播放）
            'play_sq',  // 03 SQ音质播放权限位 （0：不可以播放 1：可以播放）
            'down_lq',  // 04 普通音质下载权限位 （0：不可以下载 1：可以下载）
            'down_hq',  // 05 HQ音质下载权限位 （0：不可以下载 1：可以下载）
            'down_sq',  // 06 SQ音质下载权限位 （0：不可以下载 1：可以下载）
            'soso',     // 07 地球展示权限位 （0：库内不展示地球 1：展示地球标志）
            'fav',      // 08 收藏权限位 （0：无权限 1：有权限）
            'share',    // 09 分享权限位 （0：无权限 1：有权限）
            'bgm',      // 10 背景音乐权限位 （0：无权限 1：有权限）
            'ring',     // 11 铃声设置权限位 （0：无权限 1：有权限）
            'sing',     // 12 唱这首歌权限位 （0：无权限 1：有权限）
            'radio',    // 13 单曲电台权限位 （0：无权限 1：有权限）
            'try',      // 14 试听权限位 （0：不可以试听 1：可以试听）
            'give',     // 15 赠送权限位 （0：不可以赠送 1：可以赠送）
            'poster',   // 16 歌词海报 （0：无权限 1：有权限）
            '', // 17 播放DTS （web不支持）
            '', // 18 下载DTS （web不支持）
            'bullet'    // 19 弹幕 （0：无权限 1：有权限）
        ];

        let action = {};
        actionKeys.forEach((key, i) => {
            if (key) {
                action[key] = !!(songSwitch & (1 << i));
            }
        });

        songdata.disableplay = !(action.play_lq || action.play_hq || action.play_sq);        
        songdata.disableposter = !action.poster;

        //组装歌手名字 多个歌手用 / 连接
        var singers = [];
        if (songdata.singer) {
            for (var k = 0; k < songdata.singer.length; k++) {
                singers.push(songdata.singer[k].name);
            }
        }
        songdata.singername = singers.join(' / ');
    }
    return songdata;
}

function simpleSongInfo(song) {
    let formatted = formatSong(song);
    return {
        name: formatted.songname || formatted.name,
        singer: formatted.singername || '',
        mid: formatted.songmid || formatted.mid,
        disableplay: formatted.disableplay || 0,
        disableposter: formatted.disableposter || 0,
        type: formatted.type,
        albummid: formatted.albummid || (formatted.album && formatted.album.mid) || '',
        duration: formatted.interval,
    };
}

function tips(time) {
    // wx.showToast({
    //     title: '加载中',
    //     icon: 'loading',
    //     duration: time
    // })
}

module.exports = {
    getLoginfo: getLoginfo,
    login: login,
    ajax: ajax,
    getPic: getPic,
    getSongSrc: getSongSrc,
    simpleSongInfo: simpleSongInfo,
    formatSong: formatSong,
    getSystemInfo: getSystemInfo,
    tips: tips,
    SPDInit: SPDInit,
    SPDMark: SPDMark,
    SPDSend: SPDSend
}