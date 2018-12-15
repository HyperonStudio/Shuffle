// miniprogram/pages/selectSong/selectSong.js

const util = require('../../util.js');
var app = getApp();

Page({
    
    data: {
        songs:[],
        inputValue: '',
        sin: 1,
        isSearching: false,
        searchLoading: false,
        searchLoadingComplete: false,
    },

    onLoad: function (options) {
        this.setData({
            songs: this.data.songs
        })
    },

    searchButtonDidTap: function() {
        if (this.data.inputValue.length == 0) {
            wx.showToast({
                title: '请输入歌曲名',
                duration: 1000
            });
            return
        }
        this.setData({
            sin: 1,
            songs: [],
            isSearching: true,
            searchLoading: true,
            searchLoadingComplete: false,
        })
        this.search()
    },

    bindKeyInput: function (e) {
        this.setData({
            inputValue: e.detail.value
        })
    },

    scrollViewDidScrollToBottom: function() {
        if (this.data.isSearching == true) {
            return
        }
        if (this.data.searchLoadingComplete == true) {
            return
        }
        this.data.isSearching = true
        this.search()
    },

    songDidSelect: function(e) {        
        let song = e.currentTarget.dataset.song
        console.log('选择: ', song)
        app.globalData.selectedSong = song
        wx.navigateTo({
            url: '../selectSongRange/selectSongRange',
        })
    },

    search: function() {
        console.log('搜索: ', this.data.inputValue, ', sin: ', this.data.sin, ', songs: ', this.data.songs.length)
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
                    console.log(res.data)
                    let formattedSongList = res.data.song.list.map((song) => {
                        return util.simpleSongInfo(song);
                    });

                    var filteredList = new Array()
                    for (var i = 0; i < formattedSongList.length;i++){
                        if(formattedSongList[i].disableplay == false)
                        {
                            filteredList.push(formattedSongList[i])
                        }
                    }


                    for (var i = 0; i < filteredList.length; i++) {
                        var image = util.getPic('album', filteredList[i].albummid, 150)                        
                        filteredList[i]['image'] = image
                    }
                    console.log('搜索成功: ', filteredList.length)
                    this.setData({
                        sin: res.data.song.curpage + 1,
                        showloading: res.data.song.totalnum > res.data.song.curpage * 20,
                        songs: this.data.songs.concat(filteredList),
                        isSearching: false,
                        searchLoading: true,
                        searchLoadingComplete: false,
                    });
                } else {
                    this.setData({
                        showloading: false,
                        isSearching: false,
                        searchLoading: false,
                        searchLoadingComplete: true,
                    });
                }
            },
            fail: function (err) {
                wx.showToast({
                    title: '搜索失败',
                    icon: 'none',
                    duration: 1000
                });
                this.setData({
                    showloading: false,
                    isSearching: false,
                });
            }
        });
    },
})