var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('maze', { title: 'Welcome to the Amazing Maze Challenge!' });
});

router.get('/dash', function(req, res, next) {
    res.render('dashboard', { title: 'Maze App Dashboard' });
});

module.exports = router;
