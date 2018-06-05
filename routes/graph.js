var express = require('express');
var router = express.Router();
var neo4j = require('neo4j-driver').v1;
var patricia = require('../src/patricia');


function get_connection(){
  return driver.session();
}

function query_ip(session, query, res){
  function wrap(k){
    var v = query[k];
    return typeof v == 'string' ? 'n.'+k+"='"+v+"'" : 'n.'+k+"="+v;
  }

  var cypher = 'MATCH (n:node) ';
  var where = Object.keys(query).filter(x => !['pageIndex', 'pageSize','sortField','sortOrder'].includes(x) && query[x]).map(wrap).join(' AND ');
  if (where) cypher += 'WHERE ' + where + ' ';
  cypher += 'WITH n '; //pipeline using 'WITH'
  if (query['sortField']) cypher += 'ORDER BY n.' + query['sortField'] + ' ' + query['sortOrder'] + ' ';
  cypher += 'SKIP ' + (query['pageIndex']-1)*query['pageSize'] + ' LIMIT ' + query['pageSize'] + ' ';
  cypher += 'MATCH (n)-[e:edge]-(m:node) RETURN n, COUNT(e) as d';
  console.log(cypher);

  session.run(cypher).then(function(result){
    var c = 'MATCH (n:node) ';
    if (where) c += 'WHERE ' + where + ' ';
    c += 'RETURN COUNT(*) as c';
    session.run(c).then(function(r){
      session.close(()=>driver.close());
      var count = r.records[0].get('c').toNumber();
      var data = result.records.map((x,i) => Object.assign(
       {},x.get('n').properties,
       {'#': (query['pageIndex']-1)*query['pageSize']+i},
       {'degree': x.get('d').toNumber()},
       {'country': patricia.matchString(trie, x.get('n').properties.ip)}
      ));
      res.json({'data': data, 'itemsCount': count});
    });
  });
}

router.get('/',function(req, res, next){
  var session = get_connection();
  query_ip(session, req.query, res);
  if (req.query.action == 'ip'){
    query_ip(session, req.query, res);
  }else if (req.query.action == 'adj'){

  }else if (req.query.action == 'vic'){

  }
});

module.exports = router;
