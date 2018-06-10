## prerequisites:
 - npm, bower
 - mysql
 - neo4j

## install:

	root# npm install
	root# bower install js-grid
	#jsgrid and js-grid are two different libs!

## import:

	root# cd import
	root# ./import-into-mysql.sh <$links>
	root# ./import-into-neo4j.sh <$links> <$database>
	#this may take a while

## config:

	root# cp config.js.tpl config.js
	#fill in the blank fields.

## run:

	root# GEO=true PORT=<$port> npm start
