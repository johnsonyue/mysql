var express = require('express');
var router = express.Router();
var mysql = require('mysql');

function get_connection(){
  return mysql.createConnection({
    host: '10.10.222.135',
    user: 'root',
    password: '1q2w3e4r',
    database: 'edges'
  });
}

function query_all(con, query, res){
  console.log(query);
  function wrap(k){
    var v = query[k];
    return typeof v == 'string' ? k+"='"+v+"'" : k+"="+v;
  }
  var sql = 'SELECT * FROM edge_table ';
  var where = Object.keys(query).filter(x => !['pageIndex', 'pageSize','sortField','sortOrder'].includes(x) && query[x]).map(wrap).join(' AND ');
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
        res.json({'data': result, 'itemsCount': r[0].count});
      });
    });
  });
}

router.get('/',function(req, res, next){
  var con = get_connection();
  query_all(con, req.query, res);
});

module.exports = router;
