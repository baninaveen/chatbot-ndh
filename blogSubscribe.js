const request = require('request');
const fbResponse = require('./FbResponses');
const config = require('./config');
const isomorphicUnfetch = require("isomorphic-unfetch");


function broadcastSystemAPI(messageData, customlabelId){
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
}

module.exports = {
    broadcastContent : (senderID)=>{
        fbResponse.sendTextMessage(senderID, "Hello this is Broadcast Message");
    },
    sendBroadcastTextMessage : (text, customlabelId) => {
        var messageData = {
              messages:[
              {
                text: text,//"This is Daily notifications Broadcast Message",
              }
             ]
    }
        //callSendAPI(messageData);
        broadcastSystemAPI(messageData, customlabelId);
    },
    sendBroadcastGenericMessage : (elements, customlabelId) => {
        var messageData = {
            messages: [
            {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: elements
                    }
                }
            }
        ]
    }
    broadcastSystemAPI(messageData, customlabelId);
    },

    subscribeArticles : (recipientId) => {
        request({
            uri: 'https://graph.facebook.com/v2.11/1922289691160887/label',
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
    },
    unSubscribeArticles : (recipientId) =>{
        request({
            uri: 'https://graph.facebook.com/v2.11/1922289691160887/label',
            qs: {
                access_token: config.FB_PAGE_TOKEN
            },
            method: 'DELETE',
            body: {user: recipientId},
            json: true
    
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var successTrue = body.success;
    
                if (successTrue == true) {
                    console.log(recipientId, "You successfully unsubscribed to Articles");
                } else {
                    console.log(recipientId, "unsub Newsletter is not available now. Try again later");
                }
            } else {
                console.error("Failed calling unsubcribe articles API", response.statusCode, response.statusMessage, body.error);
            }
        });
    },
  
    blogContent : (customlabelId) => {
        request({
            uri: 'http://blog.nextdoorhub.com/index.php/wp-json/wp/v2/posts',
            headers:{'content-type': 'application/json'},
            method: 'GET'
    
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var content = JSON.parse(body);
                let title = content[0].title.rendered;
                let link = content[0].link;
                let description = content[0].excerpt.rendered;
                console.log("Title Link Description ", link);

                var messageData = {
                    messages: [
                    {
                        attachment: {
                            type: "template",
                            payload: {
                                template_type: "generic",
                                elements:  [
                                    {
                                        "title": title, // 5th Card
                                        // "image_url":`${navbani[4]["ImgURL"]}`,
                                        "subtitle": description,
                                        "default_action": {
                                          "type": "web_url",
                                          "url": "http://www.blog.nextdoorhub.com",
                                          "messenger_extensions": false,
                                          "webview_height_ratio": "tall",
                                        },
                                        "buttons":[
                                          {
                                            "type":"web_url",
                                            "url": link,
                                            "title":"Read More"
                                          },{
                                            "type":"element_share"
                                              }               
                                          ]
                                      }
                                ]
                            }
                        }
                    }
                ]
            }
                //callSendAPI(messageData);
                broadcastSystemAPI(messageData, customlabelId);

        //         request({
        //             uri: 'https://graph.facebook.com/v2.11/me/broadcast_messages',
        //             qs: {
        //                 access_token: config.FB_PAGE_TOKEN
        //             },
        //             method: 'POST',
        //             body: {
        //              message_creative_id: messageCreativeId,
        //              custom_label_id: customlabelId
        //             },
        //             json: true
    
        //         }, function (error, response, body) {
        //             if (!error && response.statusCode == 200) {
        //                 var broadcastId = body.broadcast_id;
        //                 //var messageId = body.message_id;
    
        //                 if (broadcastId) {
        //                     console.log("Successfully send broadcast message with success id %s",
        //                         broadcastId);
        //                 } else {
        //                     console.log("Successfully called Broadcast Message API with success id %s",
        //                         broadcastId);
        //                 }
        //             } else {
        //                 console.error("Failed calling broadcast API", response.statusCode, response.statusMessage, body.error);
        //             }
        //         });
            } else {
                console.error("Failed calling blog content error API", response.statusCode, response.statusMessage, body.error);
            }
        });
    }
    
}