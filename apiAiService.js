const apiai = require('apiai');
const config = require('./config');
const fbResponse = require('./FbResponses');
const fbAction = require('./FbActions');
const facebookServices = require('./FacebookServices');

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
	language: "en",
	requestSource: "fb"
});

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
                setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
                cardTypes = [];
                timeout = i * timeoutInterval;
                setTimeout(facebookServices.handleMessage.bind(null, messages[i], sender), timeout);
            } else if ( messages[i].type == 1 && i == messages.length - 1) {
                cardTypes.push(messages[i]);
                        timeout = (i - 1) * timeoutInterval;
                        setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
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
    } else if (isDefined(action)) {
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


module.exports = {

    sendToApiAi : (sender, text) => {

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
        
}