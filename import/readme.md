# neo4j:
## install:

	root# apt-get install -y wget apt-transport-https
	root# wget -O - https://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
	root# echo 'deb https://debian.neo4j.org/repo stable/' | tee /etc/apt/sources.list.d/neo4j.list
	root# apt-get update && apt-get install -y neo4j

## config:

	#modify neo4j.conf
	dbms.active_database=<$database>
	dbms.connectors.default_listen_address=<$iip>
	dbms.memory.heap.initial_size=<$heap_size> #at least 4g
	dbms.memory.heap.max_size=<$heap_size> #at least 4g

## apoc:

	root# cd /var/lib/neo4j/plugins && wget http://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/3.4.0.1
	#add the following line to neo4j.conf
	dbms.security.procedures.unrestricted=apoc.*

## setup:

	root# su neo4j
	neo4j$ neo4j-admin set-initial-password ****
	neo4j$ neo4j start
	

## cypher shell:

	neo4j$ cypher-shell -a $ip -u neo4j -p ****

## import:

	neo4j# ./import-links.sh <$links> <$database>
        neo4j# cypher-shell -c -a $ip -u neo4j -p **** < create-index.cql

## troubleshooting:
 - permissions related:
  - remember to `su switch`
  - don't import as root, otherwise the database will appear to be empty
 - neo4j not running:
  - use `ps -ef | grep neo4j` to see if it's indeed not running
  - check `neo4j.log` use `neo4j console` to see the exception
