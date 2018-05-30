create database if not exists edges;
use edges;

drop table edge_table;
create table if not exists edge_table(
  in_ip varchar(16),
  out_ip varchar(16),
  is_dest boolean,
  star integer,
  delay float,
  frequency integer,
  ttl integer,
  monitor varchar(20),
  first_seen integer,
  last_seen integer,
  in_country varchar(2),
  out_country varchar(2),
  primary key (in_ip, out_ip)
);

load data local infile 'data.tsv'
into table edge_table
fields terminated by ' ';
