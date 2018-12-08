// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    let card = event.card
    let userID = event.userID
    let liked = event.liked
    const _ = db.command

    console.log('UpdateLikeCard UserID: ', userID, ', card: ', card, ', liked: ', liked)
    console.log('Liked: ', card.likedUserIDs)

    if (card.likedUserIDs.indexOf(userID) > -1 && liked == true) {
        return {
            result: {
                stats: {
                    updated:true,
                }
            }
        }
    }
    if (card.likedUserIDs.indexOf(userID) <= -1 && liked == false) {
        return {
            result: {
                stats: {
                    updated: true,
                }
            }
        }
    }

    try {
        if (liked) {
            const r = db.collection('CardInfo').doc(card._id).update({
                data: {
                    likedUserIDs: _.push(userID)
                }
            })
            return r
        } else {
            var newLikedUserIDs = []
            for (var i = 0; i < card.likedUserIDs.length; i++) {
                if (userID != card.likedUserIDs[i]) {
                    newLikedUserIDs.push(card.likedUserIDs[i])
                }
            }
            if (newLikedUserIDs != undefined) {
                const r = db.collection('CardInfo').doc(card._id).update({
                    data: {
                        likedUserIDs: newLikedUserIDs
                    }
                })
                return r
            }            
        }
    } catch (e) {
        console.log(e)
    }
}