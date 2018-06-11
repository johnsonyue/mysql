var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',function(req, res, next){
  res.render('rtr',{
    title: 'Router Level Topology',
    include: ['/public/javascripts/rtr.js','/bower/jsgrid/dist/jsgrid.min.js','/public/javascripts/mylib.js'],
    css: ['/bower/jsgrid/dist/jsgrid.min.css','/bower/jsgrid/dist/jsgrid-theme.min.css']
  });
});

module.exports = router;
