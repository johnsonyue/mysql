var express = require('express');
var request = require('request');
var router = express.Router();
var neo4j = require('neo4j-driver').v1;
var ip = require('ip');
var patricia = require('../src/patricia');

function get_connection(){
  return driver.session();
}

function query_ip(session, query, res, ip_list){
  var cypher = 'MATCH (n:node) ';
  var where = ip_list.map(x => '"'+x+'"').join(',');
  if (where) where = 'WHERE n.ip IN [' + where + '] ';
  cypher += where;
  cypher += 'WITH n '; //pipeline using 'WITH'
  if (query['sortField']) cypher += 'ORDER BY n.' + query['sortField'] + ' ' + query['sortOrder'] + ' ';
  if (query['pageIndex']) cypher += 'SKIP ' + (query['pageIndex']-1)*query['pageSize'] + ' LIMIT ' + query['pageSize'] + ' ';
  cypher += 'MATCH (n)-[e:edge]-(m:node) RETURN n, COUNT(e) as d';
  console.log(cypher);

  session.run(cypher).then(function(result){
    var promise = new Promise(function(resolve, reject){
      if (ip_list.length) resolve(ip_list.length);
      else {
        var c = 'MATCH (n:node) ';
        if (where) c += 'WHERE ' + where + ' ';
        c += 'RETURN COUNT(*) as c';
        session.run(c).then(function(r){
          resolve(r.records[0].get('c').toNumber());
        });
      }
    });
    promise.then(function(count){
      var data = result.records.map((x,i) => {
        var record = x.get('n').properties;
        delete record.rtr_id; delete record.is_end;
        return Object.assign(
          {},record,
          {'#': ( query['pageIndex'] ? (query['pageIndex']-1)*query['pageSize'] : 0 ) + i},
          {'degree': x.get('d').toNumber()},
          {'country': patricia.matchString(trie, x.get('n').properties.ip)}
        )
      });
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
  cypher += 'WITH distinct e ';
  cypher += 'RETURN startNode(e).ip as i, endNode(e).ip as o, properties(e) as e ';
  cypher += "LIMIT 3000";
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

function query_rtr(session, query, res, ip_list){
  function wrap(k){
    var v = query[k];
    return typeof v == 'string' ? 'n.'+k+"='"+v+"'" : 'n.'+k+"="+v;
  }
  var cypher = 'MATCH (n:node) ';
  var ip_list = ip_list.map(x => '"'+x+'"').join(',');
  if (ip_list) ip_list = 'n.ip IN [' + ip_list + ']';
  var where = Object.keys(query).filter(x => !['action', 'ip', 'pageIndex', 'pageSize','sortField','sortOrder'].includes(x) && query[x]).map(wrap).concat([ip_list]).filter(x => x).join(' AND ');
  if (!where) where = 'n.is_end = "N" ';
  cypher += 'WHERE ' + where + ' ';
  cypher += 'WITH n '; //pipeline using 'WITH'
  if (query['sortField']) cypher += 'ORDER BY n.' + query['sortField'] + ' ' + query['sortOrder'] + ' ';
  cypher += 'SKIP ' + (query['pageIndex']-1)*query['pageSize'] + ' LIMIT ' + query['pageSize'] + ' ';
  cypher += 'MATCH (n)-[e:edge]-(m:node) RETURN n, COUNT(e) as d';
  console.log(cypher);

  session.run(cypher).then(function(result){
    var c = '';
    if (query.rtr_id){
      c = 'MATCH (n:node) ';
      if (where) c += 'WHERE ' + where + ' ';
      c += 'RETURN COUNT(*) as c';
    } else{
      c = 'MATCH (c:count) WHERE c.is_end = "N" RETURN c.count as c';
    }
    session.run(c).then(function(r){
      var count = r.records[0].get('c').toNumber();
      var data = result.records.map((x,i) => {
        var record = x.get('n').properties;
        delete record.is_end;
        return Object.assign(
          {},x.get('n').properties,
          {'#': ( query['pageIndex'] ? (query['pageIndex']-1)*query['pageSize'] : 0 ) + i},
          {'degree': x.get('d').toNumber()},
          {'country': patricia.matchString(trie, x.get('n').properties.ip)}
        )
      });
      res.json({'data': data, 'itemsCount': count});
    });
  });
}

function query_rtr_iface(session, query, res){
  var cypher = 'MATCH (n:node) ';
  if (!query['rtr_id']) res.json({});
  cypher += 'WHERE n.rtr_id="' + query['rtr_id'] + '" ';
  cypher += 'WITH n ';
  cypher += 'MATCH (n)-[e:edge]-(m:node) RETURN n, COUNT(e) as d';
  console.log(cypher);

  session.run(cypher).then(function(result){
    var data = result.records.map(x => Object.assign(
      {},x.get('n').properties,
      {'degree': x.get('d').toNumber()},
      {'country': patricia.matchString(trie, x.get('n').properties.ip)}
    ));
    res.json(data);
  });
}

function query_rtr_adj(session, query, res){
  var cypher = 'MATCH (n:node)-[e:edge]-() ';
  if (!query['rtr_id']) res.json({});
  cypher += "WHERE n.rtr_id='" + query['rtr_id'] + "' ";
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

function query_rtr_vic(session, query, res){
  var cypher = 'MATCH (n:node)-[el:edge*1..3]-() ';
  if (!query['rtr_id']) res.json({});
  cypher += "WHERE n.rtr_id='" + query['rtr_id'] + "' ";
  cypher += "UNWIND el AS e ";
  cypher += 'WITH distinct e ';
  cypher += 'RETURN startNode(e).ip as i, endNode(e).ip as o, properties(e) as e ';
  cypher += "LIMIT 3000";
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
  if (req.query.action == 'ip'){
    if (req.query.ip && ip.isV4Format(req.query.ip)) {
      var url = req.protocol + '://' + req.get('host') + '/db?action=closest&ip=' + req.query.ip;
      console.log(url);
      request(
        url, {'json': true},
        (err, ret, body) => {
          if (err) throw err;
          var ip_list = body.map(x => x.ip);
          query_ip(session, req.query, res, ip_list);
        }
      );
    }else if(!req.query.ip){
      query_ip(session, req.query, res, []);
    }else{
      res.json({'data':[], 'itemsCount': 0});
    }
  }else if (req.query.action == 'adj'){
    query_adj(session, req.query, res);
  }else if (req.query.action == 'vic'){
    query_vic(session, req.query, res);
  }else if (req.query.action == 'rtr'){
    if (req.query.ip && ip.isV4Format(req.query.ip)) {
      var url = req.protocol + '://' + req.get('host') + '/db?action=closest&ip=' + req.query.ip;
      console.log(url);
      request(
        url, {'json': true},
        (err, ret, body) => {
          if (err) throw err;
          var ip_list = body.map(x => x.ip);
          query_rtr(session, req.query, res, ip_list);
        }
      );
    }else if(!req.query.ip){
      query_rtr(session, req.query, res, []);
    }
  }else if (req.query.action == 'rtr_iface'){
    query_rtr_iface(session, req.query, res);
  }else if (req.query.action == 'rtr_adj'){
    query_rtr_adj(session, req.query, res);
  }else if (req.query.action == 'rtr_vic'){
    query_rtr_vic(session, req.query, res);
  }
});

module.exports = router;
