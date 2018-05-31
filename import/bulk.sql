create database if not exists edges;
use edges;

drop table edge_table;
create table if not exists edge_table(
  in_ip varchar(16),
  out_ip varchar(16),
  is_dest char(1),
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
) engine MyISAM;

load data local infile 'data.tsv'
into table edge_table
fields terminated by ' ';

create index in_ip_index on edge_table(in_ip);
create index out_ip_index on edge_table(out_ip);
create index is_dest_index on edge_table(is_dest);
create index in_country_index on edge_table(in_country);
create index out_country_index on edge_table(out_country);
create index monitor_index on edge_table(monitor);
