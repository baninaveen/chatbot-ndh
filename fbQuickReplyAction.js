const apiAiService = require('./apiAiService');


module.exports = {

    facebookQuickReply : (senderID, quickReply, messageId) =>{
        var quickReplyPayload = quickReply.payload;
        console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);
        //send payload to api.ai
        apiAiService.sendToApiAi(senderID, quickReplyPayload);
    }
}