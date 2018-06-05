var ip = require('ip');

function addString(t, cidr, v){
  var f = cidr.split('/');
  var i = f[0];
  if (!ip.isV4Format(i)) return;
  if (f.length < 2) return;
  var len = parseInt(f[1]);
  var pfx = ip.mask(i, ip.fromPrefixLen(len));
  var bin = ip.toLong(pfx).toString(2).padStart(32,'0').substring(0, len);
  trie.addWord(bin, v);
}

function matchString(t, i){
  if (!ip.isV4Format(i)) return;
  var bin = ip.toLong(i).toString(2).padStart(32,'0');
  var data = trie.findData(bin);
  return data[data.length-1].data;
}

module.exports = {
  addString: addString,
  matchString: matchString
}

