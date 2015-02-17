var express = require('express');
var router = express.Router();

router.get('/players', function(req, res, next){
    res.render('players', {title: 'players'});
});

module.exports = router;
