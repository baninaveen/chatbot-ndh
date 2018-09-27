module.exports = {
    FB_PAGE_TOKEN: 'EAADkX01wZBhcBALOHP3uim2ZAYOq3tL3gVtAxiMGZAAEeV1fjik0hTdSCaME87i8r6OWyKg8eKbLsGUlTcgeBkhJoWFYmiH45uRTZCgXkrVJEbvS8JbWKTIKdqoZBC7GrEZA85ZCTVZACzj0IgbrCXSwRdbbyNy3S9R48fe5NBtvrQZDZD',
    FB_VERIFY_TOKEN: 'ndh_chatbot',
    API_AI_CLIENT_ACCESS_TOKEN: '5a725d1112c746d7a72efb7a15f3e12a',
    FB_APP_SECRET: '56fd35311eceb90f1119b6944481822c',
    FB_APP_ID: "251097972275735",
    SERVER_URL: "https://ndh-chatbot-facebook.herokuapp.com/",
    BLOG_SUBSCRIPTION_ID: "1922289691160887",
    ADMIN_ID: "1770141073054491",
    SENDER_ID: "2081330095516773",
    isDefined : (obj) => {
        if (typeof obj == 'undefined') {
            return false;
        }
    
        if (!obj) {
            return false;
        }
    
        return obj != null;
    },
    facebookAuth : {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'https://ndh-chatbot-facebook.herokuapp.com/auth/facebook/callback',
        'profileURL'    : 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields' : ['id', 'email', 'name'] // For requesting permissions from Facebook API
    }
};