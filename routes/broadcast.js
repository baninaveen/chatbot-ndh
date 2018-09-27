const config = require('../config');
const express = require('express');
const router = express.Router();
const fbResponse = require('../FbResponses');


router.get('/', (req, res) => {
    res.render('pages/login');
});


router.get('/no-access', (req, res) => {
    res.render('pages/no-access');
});


router.post('/broadcast', ensureAuthenticated, (req, res) => {
    res.render('pages/broadcast', {user: req.user});
});


router.get('/broadcast', ensureAuthenticated, (req, res) => {
    let message = req.body.message;
    req.session.message = message;
    console.log('Braodcast Req', req);
    res.render('broadcast-confirm', {user: req.user, message: message})
});


router.get('/broadcast-send', ensureAuthenticated, (req, res) => {
    let message = req.session.message;
    // // let allUsers = req.session.users;

    // let sender;
    // for (let i=0; i < allUsers.length; i++ ) {
    //     sender = allUsers[i].fb_id;
    //     fbService.sendTextMessage(sender, message);
    // }
   res.redirect('/broadcast/broadcast-sent');
});


router.get('/broadcast-sent', ensureAuthenticated, (req, res) => {
    res.render('pages/broadcast-sent');
});


router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/broadcast/');
});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        if(req.user.id === config.ADMIN_ID) {
            return next();
        }
        res.redirect('/broadcast/no-access');
    } else {
        res.redirect('/broadcast/');
    }
}

// function ensureAuthenticated(req, res, next) {
//     if(req.isAuthenticated()) {
//         return next();
//     } else {
//         res.redirect('/broadcast/');
//     }
// }

module.exports = router;