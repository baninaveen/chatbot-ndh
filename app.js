'use strict';

const apiai = require('apiai');
const config = require('./config');
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const uuid = require('uuid');
const axios = require('axios');
const isomorphicUnfetch = require("isomorphic-unfetch");
const fbAction = require('./FbActions');
const FbPostbacks = require('./FbPostbacks');
const FacebookServices = require('./FacebookServices');
const aiService = require('./apiAiService');
const fbResponse = require('./FbResponses');
const schedule = require('node-schedule');
const blogSubscribe = require('./blogSubscribe');
const fbQuickReply = require('./fbQuickReplyAction');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const broadcast = require('./routes/broadcast');
const HandoverProtocol = require('./services/handoverProtocol');


// Send Broadcast Message from CronJob
broadCastJob();


// Messenger API parameters
if (!config.FB_PAGE_TOKEN) {
	throw new Error('missing FB_PAGE_TOKEN');
}
if (!config.FB_VERIFY_TOKEN) {
	throw new Error('missing FB_VERIFY_TOKEN');
}
if (!config.API_AI_CLIENT_ACCESS_TOKEN) {
	throw new Error('missing API_AI_CLIENT_ACCESS_TOKEN');
}
if (!config.FB_APP_SECRET) {
	throw new Error('missing FB_APP_SECRET');
}
if (!config.SERVER_URL) { //used for ink to static files
	throw new Error('missing SERVER_URL');
}

app.set('port', (process.env.PORT || 5000))

//verify request came from facebook
app.use(bodyParser.json({
	verify: FacebookServices.verifyRequestSignature
}));

// Set EJS Engine
app.set('view engine', 'ejs');

//serve static files in the public directory
app.use(express.static('public'));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}))

// Process application/json
app.use(bodyParser.json())

app.use(session(
	{
		secret: "nextdoorhub chatbot",
		resave: true,
		saveUninitialized: true
	}
));

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(profile, cb) {
	cb(null, profile);
});

passport.deserializeUser(function(profile, cb) {
	cb(null, profile);
});

// Facebook Passport Configuration 
passport.use(new FacebookStrategy({
		clientID: config.FB_APP_ID,
		clientSecret: config.FB_APP_SECRET,
		callbackURL: config.SERVER_URL + "auth/facebook/callback"	
	},
	function(accessToken, refreshToken, profile, cb) {
		process.nextTick(function(){
			return cb(null, profile);
		});
	}
));

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
	language: "en",
	requestSource: "fb"
});

const sessionIds = new Map();

function broadCastJob(){
	console.log('Broadcast Block');
	var j = schedule.scheduleJob('*/2 * * * *', function(){
		console.log('The answer to life, the universe, and everything!');
		blogSubscribe.blogContent(config.BLOG_SUBSCRIPTION_ID);
		// blogSubscribe.sendBroadcastTextMessage("Hello this is Broadcast Messages", config.BLOG_SUBSCRIPTION_ID);
	});
}

app.use('/broadcast', broadcast);
// Facebook Auth route
app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'public_profile'}));

app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {successRedirect: '/broadcast/broadcast', failureRedirect: '/broadcast'}));

// Index route
app.get('/', function (req, res) {
	// res.send('Hello world, I am a chat bot');
	res.render('pages/index');
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	console.log("request");
	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
})

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook/', function (req, res) {
	var data = req.body;

	console.log('Data:',JSON.stringify(data));

	// Make sure this is a page subscription
	if (data.object == 'page') {
		// Iterate over each entry
		// There may be multiple if batched
		data.entry.forEach(function (pageEntry) {
			var pageID = pageEntry.id;
			var timeOfEvent = pageEntry.time;

			// Iterate over each messaging event
			pageEntry.messaging.forEach(function (messagingEvent) {
				if (messagingEvent.optin) {
					FacebookServices.receivedAuthentication(messagingEvent);
				} else if (messagingEvent.message) {
					receivedMessage(messagingEvent);
				} else if (messagingEvent.delivery) {
					FacebookServices.receivedDeliveryConfirmation(messagingEvent);
				} else if (messagingEvent.postback) {
					// receivedPostback(messagingEvent);
					FbPostbacks.receivedPostback(messagingEvent);
				} else if (messagingEvent.read) {
					FacebookServices.receivedMessageRead(messagingEvent);
				} else if (messagingEvent.account_linking) {
					FacebookServices.receivedAccountLink(messagingEvent);
				// } else if (messagingEvent.standby) {
				// 	console.log('Standby', messagingEvent);
				// 	receivedStandby(messagingEvent);
				} else {
					console.log("Webhook received unknown messagingEvent: ", messagingEvent);
				}
			});
		});

		// Assume all went well.
		// You must send back a 200, within 20 seconds
		res.sendStatus(200);
	}
});

// function receivedStandby(event) {
// 	const psid = event.sender.id;
// 	const message = event.message;

// 	if (message && message.quick_reply && message.quick_reply.payload == 'take_from_inbox') {
// 	  // quick reply to take from Page inbox was clicked          
// 	  text = 'The Primary Receiver is taking control back. \n\n Tap "Pass to Inbox" to pass thread control to the Page Inbox.';
// 	  title = 'Pass to Inbox';
// 	  payload = 'pass_to_inbox';
	  
// 	  fbResponse.sendQuickReply(psid, text, title, payload);
// 	  HandoverProtocol.takeThreadControl(psid);
// 	}

//   }

function receivedMessage(event){
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
		facebookQuickReply(senderID, quickReply, messageId);
		return;
	}

	if (messageText) {
		//send message to api.ai
		sendToApiAi(senderID, messageText);
	} else if (messageAttachments) {
		fbAction.handleMessageAttachments(messageAttachments, senderID);
	}
}


function handleApiAiResponse (sender, response) {
    let responseText = response.result.fulfillment.speech;
    let responseData = response.result.fulfillment.data;
    let messages = response.result.fulfillment.messages;
    let action = response.result.action;
    let contexts = response.result.contexts;
    let parameters = response.result.parameters;

    fbResponse.sendTypingOff(sender);

    if (config.isDefined(messages) && (messages.length == 1 && messages[0].type != 0 || messages.length > 1)) {
        let timeoutInterval = 1100;
        let previousType ;
        let cardTypes = [];
        let timeout = 0;
        for (var i = 0; i < messages.length; i++) {

            if ( previousType == 1 && (messages[i].type != 1 || i == messages.length - 1)) {

                timeout = (i - 1) * timeoutInterval;
                setTimeout(facebookServices.handleCardMessages.bind(null, cardTypes, sender), timeout);
                cardTypes = [];
                timeout = i * timeoutInterval;
                setTimeout(facebookServices.handleMessage.bind(null, messages[i], sender), timeout);
            } else if ( messages[i].type == 1 && i == messages.length - 1) {
                cardTypes.push(messages[i]);
                        timeout = (i - 1) * timeoutInterval;
                        setTimeout(facebookServices.handleCardMessages.bind(null, cardTypes, sender), timeout);
                        cardTypes = [];
            } else if ( messages[i].type == 1 ) {
                cardTypes.push(messages[i]);
            } else {
                timeout = i * timeoutInterval;
                setTimeout(facebookServices.handleMessage.bind(null, messages[i], sender), timeout);
            }

            previousType = messages[i].type;

        }
    } else if (responseText == '' && !config.isDefined(action)) {
        //api ai could not evaluate input.
        console.log('Unknown query' + response.result.resolvedQuery);
        fbResponse.sendTextMessage(sender, "I'm not sure what you want. Can you be more specific?");
    } else if (config.isDefined(action)) {
        // handleApiAiAction(sender, action, responseText, contexts, parameters);
        fbAction.FacebookAction(sender, action, responseText, contexts, parameters);
    } else if (config.isDefined(responseData) && config.isDefined(responseData.facebook)) {
        try {
            console.log('Response as formatted message' + responseData.facebook);
            fbResponse.sendTextMessage(sender, responseData.facebook);
        } catch (err) {
            fbResponse.sendTextMessage(sender, err.message);
        }
    } else if (config.isDefined(responseText)) {

        fbResponse.sendTextMessage(sender, responseText);
    }
}

function facebookQuickReply(senderID, quickReply, messageId){
	var quickReplyPayload = quickReply.payload;
	console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);
	//send payload to api.ai
	sendToApiAi(senderID, quickReplyPayload);
}

function sendToApiAi(sender, text) {
	fbResponse.sendTypingOn(sender);
	let apiaiRequest = apiAiService.textRequest(text, {
		sessionId: sessionIds.get(sender)
	});

	apiaiRequest.on('response', (response) => {
		if (config.isDefined(response.result)) {
			handleApiAiResponse(sender, response);
		}
	});

	apiaiRequest.on('error', (error) => console.error(error));
	apiaiRequest.end();
}

// Spin up the server
app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'))
})
