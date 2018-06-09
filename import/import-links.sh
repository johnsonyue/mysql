#!/bin/bash

links2csv(){
test $# -lt 2 && exit
links=$1
database=$2
echo "ip:ID,:LABEL" >$database-nodes-header.csv
echo "in_ip:START_ID,out_ip:END_ID,is_dest,start,delay,freq,ttl,monitor,firstseen,lastseen,:TYPE" >$database-links-header.csv
cat $links | cut -d' ' -f1-10 | sed 's/ /,/g' | sed 's/$/,edge/' >$database-links.csv
cat $links | awk '{print $1; print $2}' | sort -u | sed 's/$/,node/' >$database-nodes.csv
}

usage(){
  echo "./import-links.sh <\$links> <\$databases>"
}

test $# -lt 2 && usage && exit
links=$1
database=$2
into="/var/lib/neo4j/data/databases/"$database

links2csv $links $database
neo4j-import --into $into --nodes "$database-nodes-header.csv,$database-nodes.csv" --relationships "$database-links-header.csv,$database-links.csv"
