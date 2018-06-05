var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',function(req, res, next){
  res.render('ip',{
    title: 'IP Level Topology',
    include: ['/public/javascripts/ip.js','/bower/jsgrid/dist/jsgrid.min.js'],
    css: ['/bower/jsgrid/dist/jsgrid.min.css','/bower/jsgrid/dist/jsgrid-theme.min.css']
  });
});

module.exports = router;
