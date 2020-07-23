create database dich_box;
-- enter the database
\c dich_box 

-- users' data
create table users (
  id serial primary key,
  name varchar(20) not null,
  name_color varchar(26) default 'rgb(0, 217, 255)',
  email varchar(50) not null,
  passwd varchar(16) not null,
  followers int default 0,
  reg_date timestamp default now(),
  subscriptions int[] default '{}',
  description varchar(200) default '',
  description_name varchar(26) default 'orange'
);

-- storage units
create table boxes (
  id serial primary key,
  name varchar(40),
  owner_id int not null 
    references users (id) 
    on delete cascade
    on update cascade,
  access_level varchar(7) not null,
  description varchar(200) default '',
  reg_date timestamp default now()
);

-- privacy mode for box
create table box_access (
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
create table box_entries (
  id serial primary key,
  box_id int not null 
    references boxes (id) 
    on delete cascade
    on update cascade,
  name varchar(350),
  type varchar(5),
  description varchar(200) default '',
  file_entries text default ''
);
