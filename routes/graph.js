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
  var where = Object.keys(query).filter(x => !['action', 'pageIndex', 'pageSize','sortField','sortOrder'].includes(x) && query[x]).map(wrap).join(' AND ');
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

function query_adj(session, query, res){
  var cypher = 'MATCH (n:node)-[e:edge]-() ';
  if (!query['ip']) res.json({});
  cypher += "WHERE n.ip='" + query['ip'] + "' ";
  cypher += 'RETURN startNode(e).ip as i, endNode(e).ip as o, properties(e) as e';
  console.log(cypher);

  session.run(cypher).then(function(result){
    var data = result.records.map(x => Object.assign(
      {}, {'in_ip': x.get('i'), 'out_ip': x.get('o')},
      {'in_country': patricia.matchString(trie, x.get('i'))},
      {'out_country': patricia.matchString(trie, x.get('o'))},
      x.get('e'),
    ));
    res.json(data);
  });
}

function query_vic(session, query, res){
  var cypher = 'MATCH (n:node)-[el:edge*1..3]-() ';
  if (!query['ip']) res.json({});
  cypher += "WHERE n.ip='" + query['ip'] + "' ";
  cypher += "UNWIND el AS e ";
  cypher += 'RETURN startNode(e).ip as i, endNode(e).ip as o, properties(e) as e ';
  cypher += "LIMIT 1000";
  console.log(cypher);

  session.run(cypher).then(function(result){
    var data = result.records.map(x => Object.assign(
      {}, {'in_ip': x.get('i'), 'out_ip': x.get('o')},
      {'in_country': patricia.matchString(trie, x.get('i'))},
      {'out_country': patricia.matchString(trie, x.get('o'))},
      x.get('e'),
    ));
    res.json(data);
  });
}

router.get('/',function(req, res, next){
  var session = get_connection();
  //query_ip(session, req.query, res);
  if (req.query.action == 'ip'){
    query_ip(session, req.query, res);
  }else if (req.query.action == 'adj'){
    query_adj(session, req.query, res);
  }else if (req.query.action == 'vic'){
    query_vic(session, req.query, res);
  }
});

module.exports = router;
