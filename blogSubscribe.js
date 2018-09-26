const request = require('request');
const fbResponse = require('./FbResponses');
const config = require('./config');


module.exports = {
    broadcastContent : (senderID)=>{
        fbResponse.sendTextMessage(senderID, "Hello this is Broadcast Message");
    },
    broadcastSystemAPI : (messageData, customlabelId) => {
        request({
            uri: 'https://graph.facebook.com/v2.11/me/message_creatives',
            qs: {
                access_token: config.FB_PAGE_TOKEN
            },
            headers:{'content-type': 'application/json'},
            method: 'POST',
            body: messageData,
            json: true
    
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var messageCreativeId = body.message_creative_id;
                console.log("message creative "+messageCreativeId);
                request({
                    uri: 'https://graph.facebook.com/v2.11/me/broadcast_messages',
                    qs: {
                        access_token: config.FB_PAGE_TOKEN
                    },
                    method: 'POST',
                    body: {
                     message_creative_id: messageCreativeId,
                     custom_label_id: customlabelId
                    },
                    json: true
    
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var broadcastId = body.broadcast_id;
                        //var messageId = body.message_id;
    
                        if (broadcastId) {
                            console.log("Successfully send broadcast message with success id %s",
                                broadcastId);
                        } else {
                            console.log("Successfully called Broadcast Message API with success id %s",
                                broadcastId);
                        }
                    } else {
                        console.error("Failed calling broadcast API", response.statusCode, response.statusMessage, body.error);
                    }
                });
            } else {
                console.error("Failed calling broadcast 200 error API", response.statusCode, response.statusMessage, body.error);
            }
        });
    },
    subscribeArticles : (recipientId) => {
        request({
            uri: 'https://graph.facebook.com/v2.11/1940719912624635/label',
            qs: {
                access_token: config.FB_PAGE_TOKEN
            },
            method: 'POST',
            body: { user: recipientId },
            json: true
    
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var successTrue = body.success;
    
                if (successTrue == true) {
                    console.log(recipientId, "You success subscribed to Articles");
                } else {
                    console.log(recipientId, "sub Newsletter is not available now. Try again later");
                }
            } else {
                console.error("Failed calling subscribe articles API", response.statusCode, response.statusMessage, body.error);
            }
        });
    }
}