var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',function(req, res, next){
  res.render('index',{
    title: 'MySQL Inspector',
    include: ['/public/javascripts/index.js','/bower/jsgrid/dist/jsgrid.min.js'],
    css: ['/bower/jsgrid/dist/jsgrid.min.css','/bower/jsgrid/dist/jsgrid-theme.min.css']
  });
});

module.exports = router;
