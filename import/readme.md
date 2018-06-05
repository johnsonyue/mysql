# neo4j:
## install:

	root# apt-get install -y wget apt-transport-https
	root# wget -O - https://debian.neo4j.org/neotechnology.gpg.key | apt-key add -
	root# echo 'deb https://debian.neo4j.org/repo stable/' | tee /etc/apt/sources.list.d/neo4j.list
	root# apt-get update && apt-get install -y neo4j

## setup:

	root# su neo4j
	neo4j$ neo4j-admin set-initial-password ****
	neo4j$ neo4j start

## cypher shell:

	neo4j$ cypher-shell -a $ip -u neo4j -p ****

## import:

	root# neo4j-import --into /var/lib/neo4j/data/databases/<$database_name> --nodes "nodes-header.csv, nodes.csv" --relationships "links-header.csv, links.csv"
