#!/bin/bash

int(){
python <(
cat << "EOF"
import struct
import socket

def ip_str2int(ip):
  packedIP = socket.inet_aton(ip)
  return struct.unpack("!L", packedIP)[0]

while True:
  try:
    l=raw_input().strip()
  except:
    break
  print l+' '+str(ip_str2int(l))
EOF
)
}

links2dsv(){
links=$1
test ! "$links"x == "links.dsv" && cp $links links.dsv
cat $links | awk '{print $1; print $2}' | sort -u | int >nodes.dsv
}

usage(){
  echo "./import-links.sh <\$links>"
}

test $# -lt 1 && usage && exit
links=$1

#links2dsv $links
mysql -u root -p <bulk.sql
