const fbResponse = require('./FbResponses');
const uuid = require('uuid');
const fbAction = require('./FbActions');
const aiService = require('./apiAiService');
const fbQuickReply = require('./fbQuickReplyAction');
const crypto = require('crypto');
const config = require('./config');


const sessionIds = new Map();

// Internal Functions
function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: config.FB_PAGE_TOKEN
		},
		method: 'POST',
		json: messageData

	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;

			if (messageId) {
				console.log("Successfully sent message with id %s to recipient %s",
					messageId, recipientId);
			} else {
				console.log("Successfully called Send API for recipient %s",
					recipientId);
			}
		} else {
			console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
		}
	});
}

module.exports = {

    receivedMessage : (event) => {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;
    
        if (!sessionIds.has(senderID)) {
            sessionIds.set(senderID, uuid.v1());
        }
        //console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
        //console.log(JSON.stringify(message));
    
        var isEcho = message.is_echo;
        var messageId = message.mid;
        var appId = message.app_id;
        var metadata = message.metadata;
    
        // You may get a text or attachment but not both
        var messageText = message.text;
        var messageAttachments = message.attachments;
        var quickReply = message.quick_reply;
    
        if (isEcho) {
            fbAction.handleEcho(messageId, appId, metadata);
            return;
        } else if (quickReply) {
            fbQuickReply.facebookQuickReply(senderID, quickReply, messageId);
            return;
        }
    
        if (messageText) {
            //send message to api.ai
            aiService.sendToApiAi(senderID, messageText);
        } else if (messageAttachments) {
            fbAction.handleMessageAttachments(messageAttachments, senderID);
        }
    },

    handleMessage : (message, sender) => {
        switch (message.type) {
            case 0: //text
                fbResponse.sendTextMessage(sender, message.speech);
                break;
            case 2: //quick replies
                let replies = [];
                for (var b = 0; b < message.replies.length; b++) {
                    let reply =
                    {
                        "content_type": "text",
                        "title": message.replies[b],
                        "payload": message.replies[b]
                    }
                    replies.push(reply);
                }
                fbResponse.sendQuickReply(sender, message.title, replies);
                break;
            case 3: //image
                fbResponse.sendImageMessage(sender, message.imageUrl);
                break;
            case 4:
                // custom payload
                var messageData = {
                    recipient: {
                        id: sender
                    },
                    message: message.payload.facebook
    
                };
    
                callSendAPI(messageData);
    
                break;
        }
    },

    handleCardMessages : (messages, sender) => {
        let elements = [];
        for (var m = 0; m < messages.length; m++) {
            let message = messages[m];
            let buttons = [];
            for (var b = 0; b < message.buttons.length; b++) {
                let isLink = (message.buttons[b].postback.substring(0, 4) === 'http');
                let button;
                if (isLink) {
                    button = {
                        "type": "web_url",
                        "title": message.buttons[b].text,
                        "url": message.buttons[b].postback
                    }
                } else {
                    button = {
                        "type": "postback",
                        "title": message.buttons[b].text,
                        "payload": message.buttons[b].postback
                    }
                }
                buttons.push(button);
            }
    
    
            let element = {
                "title": message.title,
                "image_url":message.imageUrl,
                "subtitle": message.subtitle,
                "buttons": buttons
            };
            elements.push(element);
        }
        fbResponse.sendGenericMessage(sender, elements);
    },

    /*
    * Message Read Event
    *
    * This event is called when a previously-sent message has been read.
    * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
    * 
    */
    receivedMessageRead : (event) => {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        // All messages before watermark (a timestamp) or sequence have been seen.
        var watermark = event.read.watermark;
        var sequenceNumber = event.read.seq;

        console.log("Received message read event for watermark %d and sequence " +
            "number %d", watermark, sequenceNumber);
    },

    /*
    * Account Link Event
    *
    * This event is called when the Link Account or UnLink Account action has been
    * tapped.
    * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
    * 
    */
    receivedAccountLink : (event) => {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        var status = event.account_linking.status;
        var authCode = event.account_linking.authorization_code;

        console.log("Received account link event with for user %d with status %s " +
            "and auth code %s ", senderID, status, authCode);
    },
    /*
    * Delivery Confirmation Event
    *
    * This event is sent to confirm the delivery of a message. Read more about 
    * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
    *
    */
    receivedDeliveryConfirmation : (event) => {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var delivery = event.delivery;
        var messageIDs = delivery.mids;
        var watermark = delivery.watermark;
        var sequenceNumber = delivery.seq;

        if (messageIDs) {
            messageIDs.forEach(function (messageID) {
                console.log("Received delivery confirmation for message ID: %s",
                    messageID);
            });
        }

        console.log("All message before %d were delivered.", watermark);
    },
    /*
    * Authorization Event
    *
    * The value for 'optin.ref' is defined in the entry point. For the "Send to 
    * Messenger" plugin, it is the 'data-ref' field. Read more at 
    * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
    *
    */
    receivedAuthentication : (event) => {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfAuth = event.timestamp;

        // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
        // The developer can set this to an arbitrary value to associate the 
        // authentication callback with the 'Send to Messenger' click event. This is
        // a way to do account linking when the user clicks the 'Send to Messenger' 
        // plugin.
        var passThroughParam = event.optin.ref;

        console.log("Received authentication for user %d and page %d with pass " +
            "through param '%s' at %d", senderID, recipientID, passThroughParam,
            timeOfAuth);

        // When an authentication is received, we'll send a message back to the sender
        // to let them know it was successful.
        FbResponse.sendTextMessage(senderID, "Authentication successful");
    },
    /*
    * Verify that the callback came from Facebook. Using the App Secret from 
    * the App Dashboard, we can verify the signature that is sent with each 
    * callback in the x-hub-signature field, located in the header.
    *
    * https://developers.facebook.com/docs/graph-api/webhooks#setup
    *
    */
    verifyRequestSignature : (req, res, buf) => {
        var signature = req.headers["x-hub-signature"];

        if (!signature) {
            throw new Error('Couldn\'t validate the signature.');
        } else {
            var elements = signature.split('=');
            var method = elements[0];
            var signatureHash = elements[1];

            var expectedHash = crypto.createHmac('sha1', config.FB_APP_SECRET)
                .update(buf)
                .digest('hex');

            if (signatureHash != expectedHash) {
                throw new Error("Couldn't validate the request signature.");
            }
        }
    }
}