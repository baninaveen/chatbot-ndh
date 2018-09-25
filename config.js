module.exports = {
    FB_PAGE_TOKEN: 'EAADkX01wZBhcBALOHP3uim2ZAYOq3tL3gVtAxiMGZAAEeV1fjik0hTdSCaME87i8r6OWyKg8eKbLsGUlTcgeBkhJoWFYmiH45uRTZCgXkrVJEbvS8JbWKTIKdqoZBC7GrEZA85ZCTVZACzj0IgbrCXSwRdbbyNy3S9R48fe5NBtvrQZDZD',
    FB_VERIFY_TOKEN: 'ndh_chatbot',
    API_AI_CLIENT_ACCESS_TOKEN: '5a725d1112c746d7a72efb7a15f3e12a',
    FB_APP_SECRET: '56fd35311eceb90f1119b6944481822c',
    SERVER_URL: "https://ndh-chatbot-facebook.herokuapp.com/",
    BLOG_SUBSCRIPTION_ID: "1922289691160887",
    isDefined : (obj) => {
        if (typeof obj == 'undefined') {
            return false;
        }
    
        if (!obj) {
            return false;
        }
    
        return obj != null;
    }
};