var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('maze', { title: 'Welcome to the Amazing Maze Challenge!' });
});

router.get('/dash', function(req, res, next) {
    res.render('dashboard', { title: 'Maze App Dashboard' });
});

router.get('/help', function(req, res, next) {
    res.render('help', { title: 'About the Amazing Maze Challenge' });
});

router.get('/hall', function(req, res, next) {
    res.render('halloffame', { title: 'The Amazing Maze Challenge Hall of Fame' });
});

router.get('/admin', function(req, res, next){
    res.render('admin', {title: 'Administration'});
});

module.exports = router;
