const config = require('./config');
const request = require('request');
const fbResponse = require('./FbResponses');
const express = require('express');
const apiAiService = require('./apiAiService');


module.exports = {

    greetUserText : (userId) => {
        //first read user firstname
        request({
            uri: 'https://graph.facebook.com/v2.7/' + userId,
            qs: {
                access_token: config.FB_PAGE_TOKEN
            }
    
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
    
                var user = JSON.parse(body);
    
                if (user.first_name) {
                    console.log("FB user: %s %s, %s",
                        user.first_name, user.last_name, user.gender);
                    let reply = [
                        {
                          "content_type":"text",
                          "title":"Shopping",
                          "payload": "shopping"
                        },
                        {
                            "content_type":"text",
                            "title":"Content",
                            "payload": "blog"
    
                          }
                      ]
                    
                    fbResponse.sendQuickReply(userId, `Welcome  ${user.first_name} ${user.last_name} !`, reply);
                } else {
                    console.log("Cannot get data for fb user with id",
                        userId);
                }
            } else {
                console.error(response.error);
            }
    
        });
    }
}