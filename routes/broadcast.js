const config = require('../config');
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('pages/login');
});


router.get('/no-access', (req, res) => {
    res.render('pages/no-access');
});


router.get('/broadcast', ensureAuthenticated, (req, res) => {
    res.render('pages/broadcast', {user: req.user});
});


router.get('/broadcast', ensureAuthenticated, (req, res) => {
    res.render('pages/broadcast-confirm');
});


router.get('/broadcast-send', ensureAuthenticated, (req, res) => {
   res.redirect('/broadcast/broadcast-sent');
});


router.get('/broadcast-sent', ensureAuthenticated, (req, res) => {
    res.render('pages/broadcast-sent');
});


router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/broadcast/');
});

// function ensureAuthenticated(req, res, next) {
//     if(req.isAuthenticated()) {
//         if(req.user.id === config.ADMIN_ID) {
//             return next();
//         }
//         res.redirect('/broadcast/no-access');
//     } else {
//         res.redirect('/broadcast/');
//     }
// }

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/broadcast/');
    }
}

module.exports = router;