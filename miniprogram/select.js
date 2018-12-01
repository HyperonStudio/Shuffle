const util = require('../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        screenHeight: 'auto', // 屏幕高度
        searchResult: [], // 搜索结果
        smartBoxList: [], // smartbox列表
        hotList: [], // 热门音乐列表
        searchState: 'nosearch', // 搜索状态 nosearch/searchinput/searching
        inputValue: '',// 关键字
        sin: 1, // 分页页号
        showloading: true
    },
    onLoad: function(options) {
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    screenHeight: res.windowHeight
                })
            }
        })
        util.ajax({
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
                        return util.simpleSongInfo(song.data);
                    });
                    this.setData({
                        hotList: formattedSongList,
                        showloading: false
                    })
                }
            },
            fail: function(err) {
                util.tip('拉取热门歌曲失败');
            }
        });
    },
    inputTap: function() {
        this.setData({
            searchState: 'searchinput',
            showloading: false
        });
    },
    clearInput: function () {
        this.setData({
            inputValue: '',
            searchResult: [],
            smartBoxList: [],
            sin: 1,
            showloading: false,
            searchState: 'searchinput'
        });
    },
    getSmartBox: function () {
        util.ajax({
            url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
            method: "GET",
            data: {
                data: JSON.stringify({
                    "smartBox": {
                        "module": "tencent_music_soso_smartbox_cgi.SmartBoxCgi",    //  服务名称
                        "method": "GetSmartBoxResult",                    //  方法
                        "param": {
                            "search_id": "123",
                            "query": this.data.inputValue,
                            "num_per_page": 20,
                            "page_idx": this.data.sin
                        }
                    }
                })
            },
            success: (res) => {
                res = res.data || {};
                if (res.smartBox && res.smartBox.data && res.smartBox.data.items && res.smartBox.data.items.length) {
                    let newItems = res.smartBox.data.items;
                    this.setData({
                        sin: this.data.sin + 1,
                        smartBoxList: this.data.smartBoxList.concat(newItems),
                        showloading: res.smartBox.data.total_num > this.data.smartBoxList.length + newItems.length + 1
                    });
                }
            },
            fail: function (err) {
                util.tip('搜索失败');
            }
        });
    },
    changeInput: function (e) {
        this.setData({
            inputValue: e.detail.value,
            sin: 1,
            smartBoxList: []
        });

        if (!this.data.inputValue) {
            this.setData({
                smartBoxList: [],
                showloading: false
            });
            return;
        }

        this.getSmartBox();
    },
    cancelSearch: function (e) {
        this.setData({
            searchState: 'nosearch',
            inputValue: '',
            searchResult: [],
            smartBoxList: [],
            sin: 1,
            showloading: false
        });
    },
    searchHint: function (e) {
        let hint = e.currentTarget.dataset.val || '';
        this.setData({
            inputValue: hint,
            searchState: 'searching',
            showloading: true,
            smartBoxList: [],
            sin: 1
        });
        this.search();
    },
    search: function () {
        util.ajax({
            url: 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp',
            method: "GET",
            data: {
                ct: 25,
                t: 0,
                aggr: 1,
                cr: 1,
                catZhida: 0,
                lossless: 0,
                flag_qc: 0,
                p: this.data.sin,
                n: 20,
                w: this.data.inputValue,
                needNewCode: 1,
                new_json: 1,
                format: 'json',
                platform: 'h5'
            },
            success: (res) => {
                res = res.data || {};
                if (res.code == 0 && res.data && res.data.song && res.data.song.list && res.data.song.list.length) {
                    let formattedSongList = res.data.song.list.map((song) => {
                        return util.simpleSongInfo(song);
                    });
                    this.setData({
                        sin: res.data.song.curpage + 1,
                        showloading: res.data.song.totalnum > res.data.song.curpage * 20,
                        searchResult: this.data.searchResult.concat(formattedSongList)
                    });
                }
                else {
                    this.setData({
                        showloading: false,
                        searchResult: []
                    });
                }
            },
            fail: function (err) {
                util.tip('搜索失败');
            }
        });
    },
    submitSearch: function (e) {
        this.setData({
            searchState: 'searching',
            inputValue: e.detail.value,
            showloading: true,
            sin: 1
        });
        this.search();
    },
    playsong: function (e) {
        let dataset = e.currentTarget.dataset;  
        let disable = dataset.disable;
        if (disable == 1) {
            return;
        }
        
        let mid = dataset.mid;
        let type = dataset.type;
        let name = dataset.name;
        let singer = dataset.singer;
        let albummid = dataset.albummid;
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
                playState: 'pause'
            });
        });

        backgroundAudioManager.onStop(() => {
            this.setData({
                playState: 'stop'
            });
        });

        backgroundAudioManager.onError(() => {
            this.setData({
                playState: 'error'
            });
        });

        backgroundAudioManager.onPlay(() => {
            this.setData({
                playState: 'playing'
            });
        });

        util.getSongSrc([mid], [type], (url) => {
            backgroundAudioManager.title = name || '';
            backgroundAudioManager.singer = singer || ''
            backgroundAudioManager.coverImgUrl = util.getPic('album', albummid, 300);
            backgroundAudioManager.src = url;
            this.setData({
                curPlayMid: mid
            });
        });
    },
    loadMore: function () {
        if (this.data.searchState == 'searchinput' && this.data.showloading) {
            // smartbox 滚动加载
            this.getSmartBox();
        }
        else if (this.data.searchState == 'searching' && this.data.showloading) {
            this.search();
        }
    },
    goLyricPoster: function (e) {
        let dataset = e.currentTarget.dataset;
        let disable = dataset.disable;
        if (disable == 1) {
            return;
        }

        let mid = dataset.mid;
        let type = dataset.type;
        wx.navigateTo({
            url: '../process/process?mid=' + mid + '&type=' +type,
        });
    }
})