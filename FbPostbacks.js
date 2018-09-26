const FbResponse = require('./FbResponses');
const fbCustom = require('./fbCustomFunction');


module.exports = {
    /*
    * Postback Event
    *
    * This event is called when a postback is tapped on a Structured Message. 
    * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
    * 
    */
    receivedPostback : (event) => {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;
    
        // The 'payload' param is a developer-defined field which is set in a postback 
        // button for Structured Messages. 
        var payload = event.postback.payload;
    
        switch (payload) {
            case "GET_STARTED":
                fbCustom.greetUserText(senderID);
                break;
    
            case "SUBSCRIBE_BLOG":
                FbResponse.sendTextMessage(senderID, "Thank you for subscribing to our Newletter. We will send best Deals and Offers right here");
                break;
            
            case "UNSUBSCRIBE_BLOG":
                FbResponse.sendTextMessage(senderID, "Sorry for inconvenience. You can always Subscribe back to avail best deals and offers from NextDoorHub. Simply type 'Subscribe'");
                break;
            
            case "MANAGE_SUBSCRIPTION":
                let manage_replies = [
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
                FbResponse.sendQuickReply(senderID, "Would you like to subscribe to our newletter and Best Deals and Offer?", manage_replies);
                break;
            
            case "CONTACT_INFO":
                FbResponse.sendTextMessage(senderID, "If you encounter any problem Please, mail at support@nextdoorhub.com");
                break;
            default:
                //unindentified payload
                FbResponse.sendTextMessage(senderID, "I'm not sure what you want. Can you be more specific?");
                break;
        }
    
        console.log("Received postback for user %d and page %d with payload '%s' " +
            "at %d", senderID, recipientID, payload, timeOfPostback);
    
    }
}