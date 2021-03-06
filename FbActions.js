const config = require('./config');
const FbResponse = require('./FbResponses');
const express = require('express');
const apiAiService = require('./apiAiService');
const broadCast = require('./blogSubscribe');
const fbCustom = require('./fbCustomFunction');

module.exports = {
    FacebookAction : (sender, action, responseText, contexts, parameters)=>{
        switch (action) {
            case "input.welcome":
                FbResponse.sendTextMessage(sender, "Hello this is Welcome Message from NDH");
                break;
            
            case "MainmenuActivity":
                fbCustom.greetUserText(sender);
                break;

            case "SubscribeActivity":
                FbResponse.sendTextMessage(sender, "Thank you for subscribing to our Newletter. We will send best Deals and Offers right into your inbox");
                broadCast.subscribeArticles(sender);
                break;
                
            case "UnsubcribeActivity":
                let unsub_reply = [
                    {
                    "content_type":"text",
                    "title":"Subscribe",
                    "payload": "SUBSCRIBE_BLOG"
                    }
                ]
                FbResponse.sendQuickReply(sender, "Sorry for inconvenience. You can always Subscribe back to avail best deals and offers from NextDoorHub. Simply type 'Subscribe'", unsub_reply)
                broadCast.unSubscribeArticles(sender);
                break;    
            
            case "SubscriptionActivity":
                let subscribe_replies = [
                    {
                        "content_type":"text",
                        "title":"Subscribe",
                        "payload": "SUBSCRIBE_BLOG"
                    },
                    {
                        "content_type":"text",
                        "title":"Unsubscribe",
                        "payload": "UNSUBSCRIBE_BLOG"
    
                        }
                    ]
                    FbResponse.sendQuickReply(sender, "Would you like to subscribe to our newletter and Best Deals and Offer?", subscribe_replies);
                break;
            
            case "SubscriptionActivitySubscribe":
                FbResponse.sendTextMessage(sender, "Thank you for subscribing to our Newletter. We will send best Deals and Offers right into your inbox");
                broadCast.subscribeArticles(sender);
                break;
    
            case "SubscriptionActivityUnsubscribe":
                let unsub_replies = [
                    {
                    "content_type":"text",
                    "title":"Subscribe",
                    "payload": "SUBSCRIBE_BLOG"
                    }
                ]
                FbResponse.sendQuickReply(sender, "Sorry for inconvenience. You can always Subscribe back to avail best deals and offers from NextDoorHub. Simply type 'Subscribe'", unsub_replies)
                broadCast.unSubscribeArticles(sender);
                break;
    
            default:
                //unhandled action, just send back the text
                FbResponse.sendTextMessage(sender, responseText);
        }
    },

    //https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo
    handleEcho : (messageId, appId, metadata) => {
        // Just logging message echoes to console
        console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
    },

    handleMessageAttachments : (messageAttachments, senderID) => {
        //for now just reply
        fbResponse.sendTextMessage(senderID, "Attachment received. Thank you.");	
    },    
}