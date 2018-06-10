var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var ip = require('ip');

var config = require('../config');

function get_connection(){
  return mysql.createConnection({
    host: config.mysql.ip,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: 'edges'
  });
}

function query_all(con, query, res, resolve){
  function wrap(k){
    var fuzzy_list = ['in_ip', 'out_ip', 'monitor'];
    var v = query[k];
    if (fuzzy_list.includes(k)) return k+" like '"+v+"%'";
    return typeof v == 'string' ? k+"='"+v+"'" : k+"="+v;
  }
  var sql = 'SELECT * FROM edge_table ';
  var where = Object.keys(query).filter(x => !['action', 'pageIndex', 'pageSize','sortField','sortOrder'].includes(x) && query[x]).map(wrap).join(' AND ');
  if (where) sql += 'WHERE ' + where + ' ';
  if (query['sortField']) sql += 'ORDER BY ' + query['sortField'] + ' ' + query['sortOrder'] + ' ';
  sql += 'LIMIT ' + (query['pageIndex']-1)*query['pageSize'] + ',' + query['pageSize'];
  console.log(sql);
  con.connect(function(err) {
    if (err) throw err;
    con.query(sql, function(err, result, fields){
      if (err) throw err;
      var s='SELECT COUNT(*) AS count FROM edge_table ';
      if (where) s += 'WHERE ' + where + ' ';
      con.query(s, function(err, r, fields){
        if (err) throw err;
        result.map( (x,i) => x['#'] = (query['pageIndex']-1)*query['pageSize']+i );
        resolve({'data': result, 'itemsCount': r[0].count});
      });
    });
  });
}

function query_closest_ip(con, query, res, resolve){
  if (!query.ip || ip.isV4Format(query.ip)) resolve;

  var integer = ip.toLong(query.ip);
  var a = '(SELECT ip FROM node_table WHERE ip_int >= ' + integer + ' ORDER BY ip_int ASC LIMIT 1) ';
  var b = '(SELECT ip FROM node_table WHERE ip_int <= ' + integer + ' ORDER BY ip_int DESC LIMIT 1) ';
  var sql = a + 'UNION ' + b;
  console.log(sql);
  con.connect(function(err) {
    if (err) throw err;
    con.query(sql, function(err, result, fields){
      if (err) throw err;
      resolve(result);
    });
  });
}

router.get('/',function(req, res, next){
  var con = get_connection();
  var action = req.query.action;
  if (!['all', 'closest'].includes(action)) res.json({});

  var promise = new Promise(function(resolve, reject){
    if (action == 'all') query_all(con, req.query, res, resolve);
    else if (action == 'closest') query_closest_ip(con, req.query, res, resolve);
  });
  promise.then(function(ret){ 
    con.end();
    res.json(ret);
  });
});

module.exports = router;
