#!/bin/bash

is_end(){
ifaces=$1
python <(
cat << "EOF"
import sys

f=open(sys.argv[1]); rd={}
for l in f.readlines():
  rd[l.strip()]=''
while True:
  try:
    l=raw_input().strip()
  except:
    break
  f=l.split(',')
  if rd.has_key(f[0]):
    print l+',N'
  else:
    print l+',Y'
EOF
) $ifaces
}

rtr_id(){
rtrnodes=$1
python <(
cat << "EOF"
import sys

fp=open(sys.argv[1]); rd={}; cnt=1
for l in fp.readlines():
  f=l.strip().split()
  for i in f:
    rd[i]=cnt
  cnt+=1

while True:
  try:
    l=raw_input().strip()
  except:
    break
  f=l.split(',')
  if rd.has_key(f[0]):
    print l+','+str(rd[f[0]])
  else:
    print l+',0'
EOF
) $rtrnodes
}

links2csv(){
test $# -lt 4 && exit
links=$1
ifaces=$2
rtrnodes=$3
database=$4
cat $rtrnodes | awk '{print NF" "$0}' | sort -nr | cut -d' ' -f2- >rtrnodes.dsv
echo "ip:ID,is_end,rtr_id,:LABEL" >$database-nodes-header.csv
echo "in_ip:START_ID,out_ip:END_ID,is_dest,star,delay,freq,ttl,monitor,firstseen,lastseen,:TYPE" >$database-links-header.csv
cat $links | cut -d' ' -f1-10 | sed 's/ /,/g' | sed 's/$/,edge/' >$database-links.csv
cat $links | awk '{print $1; print $2}' | sort -u | is_end $ifaces | rtr_id rtrnodes.dsv | sed 's/$/,node/' >$database-nodes.csv
}

usage(){
  echo "./import-links.sh <\$links> <\$ifaces> <\$rtrnodes> <\$database>"
}

test $# -lt 4 && usage && exit
links=$1
ifaces=$2
rtrnodes=$3
database=$4
into="/var/lib/neo4j/data/databases/"$database

links2csv $links $ifaces $rtrnodes $database
neo4j-import --into $into --nodes "$database-nodes-header.csv,$database-nodes.csv" --relationships "$database-links-header.csv,$database-links.csv"
