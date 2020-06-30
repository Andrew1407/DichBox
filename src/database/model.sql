create database dich_box;
-- enter the database
\c dich_box 

-- users data
create table users (
  id serial primary key,
  name varchar(30),
  email varchar(50) not null,
  passwd varchar(10) not null,
  followers int default 0,
  reg_date timestamp default now(),
  subscriptions int[] default '{}',
  description varchar(200) default ''
);

-- storage units
create table boxes (
  id serial primary key,
  name varchar(40),
  owner_id int not null 
    references users (id) 
    on delete cascade
    on update cascade,
  access_level varchar(6) not null,
  description varchar(200) default '',
  reg_date timestamp default now()
);

-- privacy mode for box
create table boxes_access (
  box_id int not null 
    references boxes (id) 
    on delete cascade
    on update cascade,
  person_id int not null 
    references users (id) 
    on delete cascade
    on update cascade,
  privileges varchar(6)[] default '{}'
);

-- stored files and diretories
create table boxes_entries (
  id serial primary key,
  box_id int not null 
    references boxes (id) 
    on delete cascade
    on update cascade,
  name varchar(350),
  type varchar(5),
  description varchar(200) default '',
  file_entries text
);
