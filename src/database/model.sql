create database dich_box;
-- enter the database
\c dich_box 

-- users' data
create table users (
  id serial primary key,
  name varchar(40) not null,
  name_color varchar(8) default '#00d9ff',
  email varchar(50) not null,
  passwd varchar(16) not null,
  followers int default 0,
  reg_date timestamp default now(),
  subscriptions int[] default '{}',
  description varchar(100) default '',
  description_color varchar(8) default '#00d9ff'
);

-- subscribers
create table subscribers (
  person_id int not null 
    references users (id) 
    on delete cascade
    on update cascade,
  subscription int not null 
    references users (id) 
    on delete cascade
    on update cascade
);

-- storage units
create table boxes (
  id serial primary key,
  name varchar(40),
  name_color varchar(8) default '#00d9ff',
  owner_id int not null 
    references users (id) 
    on delete cascade
    on update cascade,
  access_level varchar(9) not null,
  description varchar(200) default '',
  description_color varchar(8) default '#00d9ff',
  reg_date timestamp default now(),
  last_edited timestamp default now()
);

-- limited mode view
create table limited_viewers (
  box_id int not null 
    references boxes (id) 
    on delete cascade
    on update cascade,
  person_id int not null 
    references users (id) 
    on delete cascade
    on update cascade
);

-- edit access
create table box_editors (
  box_id int not null 
    references boxes (id) 
    on delete cascade
    on update cascade,
  person_id int not null 
    references users (id) 
    on delete cascade
    on update cascade
);
