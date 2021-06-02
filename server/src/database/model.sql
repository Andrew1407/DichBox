-- users' data
create table if not exists users (
  id serial primary key,
  name varchar(40) not null unique,
  name_color varchar(8) default '#00d9ff',
  email varchar(50) not null unique,
  passwd varchar(65) not null,
  followers int default 0,
  reg_date timestamp default now(),
  description varchar(100) default '',
  description_color varchar(8) default '#00d9ff'
);

-- module for uuid usage
create extension if not exists "uuid-ossp";

-- users random generated identifiers
create table if not exists uuids (
  person_id int not null 
    references users (id) 
    on delete cascade
    on update cascade,
  user_uid uuid default uuid_generate_v4()
);

-- subscribers
create table if not exists subscribers (
  person_id int not null 
    references users (id) 
    on delete cascade
    on update cascade,
  subscription int not null 
    references users (id) 
    on delete cascade
    on update cascade
);

-- users's notifications
create table if not exists notifications (
  id serial primary key,
  person_id int not null 
    references users (id) 
    on delete cascade
    on update cascade,
  type varchar(12) not null,
  param int default (-1),
  extra_values varchar(40)[2] default null,
  note_date timestamp default now()
);

-- storage units
create table if not exists boxes (
  id serial primary key,
  name varchar(40),
  name_color varchar(8) default '#00d9ff',
  owner_id int not null 
    references users (id) 
    on delete cascade
    on update cascade,
  access_level varchar(9) not null,
  description varchar(100) default '',
  description_color varchar(8) default '#00d9ff',
  reg_date timestamp default now(),
  last_edited timestamp default now()
);

-- limited mode view
create table if not exists limited_viewers (
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
create table if not exists box_editors (
  box_id int not null 
    references boxes (id) 
    on delete cascade
    on update cascade,
  person_id int not null 
    references users (id) 
    on delete cascade
    on update cascade
);

-- remove user by uuid
create or replace function rm_uuid_with_user_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  delete from users where id = old.person_id;
  return old;
end;
$$;

drop trigger if exists rm_uuid_with_user on uuids;
create trigger rm_uuid_with_user
  after delete on uuids
  for each row
  execute procedure rm_uuid_with_user_fn();

-- create uuid
create or replace function add_user_uuid_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  insert into uuids (person_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists add_user_uuid on users;
create trigger add_user_uuid
  after insert on users
  for each row
  execute procedure add_user_uuid_fn();

-- remove user as subscription (trigger)
create or replace function rm_user_subs_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  insert into notifications (person_id, type, extra_values)
    select person_id, 'userRm', array[
      (select name from users where users.id = old.id limit 1),
      (select name_color from users where users.id = old.id limit 1)
    ] from subscribers where subscription = old.id;
  update users set followers = (followers - 1) where id in (
    select subscription from subscribers where person_id = old.id
  );
  return old;
end;
$$;

drop trigger if exists rm_user_subs on users;
create trigger rm_user_subs
  before delete on users
  for each row
  execute procedure rm_user_subs_fn();

-- NOTIFICATIONS TRIGGERS

-- box creating (for followers)
create or replace function notify_box_add_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  if new.access_level = 'public' or new.access_level = 'followers' then
    insert into notifications (person_id, type, param)
    select person_id, 'boxAdd', new.id from subscribers where subscription = new.owner_id;
  end if;
  return new;
end;
$$;

drop trigger if exists notify_box_add on boxes;
create trigger notify_box_add
  after insert on boxes
  for each row
  execute procedure notify_box_add_fn();

-- adding box viewer
create or replace function notify_viewer_add_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  insert into notifications (person_id, type, param) values (new.person_id, 'viewerAdd', new.box_id);
  return new;
end;
$$;

drop trigger if exists notify_viewer_add on limited_viewers;
create trigger notify_viewer_add
  after insert on limited_viewers
  for each row
  execute procedure notify_viewer_add_fn();

-- removing box viewer
create or replace function notify_viewer_rm_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  if
    exists (select id from boxes where id = old.box_id)
    and exists (select id from users where id = old.person_id)
  then
    insert into notifications (person_id, type, param) values (old.person_id, 'viewerRm', old.box_id);
  end if;
  return old;
end;
$$;

drop trigger if exists notify_viewer_rm on limited_viewers;
create trigger notify_viewer_rm
  before delete on limited_viewers
  for each row
  execute procedure notify_viewer_rm_fn();

-- adding box editor
create or replace function notify_editor_add_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  insert into notifications (person_id, type, param) values (new.person_id, 'editorAdd', new.box_id);    
  return new;
end;
$$;

drop trigger if exists notify_editor_add on box_editors;
create trigger notify_editor_add
  after insert on box_editors
  for each row
  execute procedure notify_editor_add_fn();

-- removing box editor
create or replace function notify_editor_rm_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  if
    exists (select id from boxes where id = old.box_id)
    and exists (select id from users where id = old.person_id)
  then
    insert into notifications (person_id, type, param) values (old.person_id, 'editorRm', old.box_id);
  end if;
  return old;
end;
$$;

drop trigger if exists notify_editor_rm on box_editors;
create trigger notify_editor_rm
  before delete on box_editors
  for each row
  execute procedure notify_editor_rm_fn();

-- hello message for signed user
create or replace function hello_msg_signed_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  insert into notifications (person_id, type) values (new.id, 'helloMsg');
  return new;
end;
$$;

drop trigger if exists hello_msg_signed_fn on users;
create trigger hello_msg_signed_fn
  after insert on users
  for each row
  execute procedure hello_msg_signed_fn();

-- removing notifications if user was deleted
create or replace function user_msgs_rm_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  delete from notifications where
    type in ('viewerAdd', 'viewerRm', 'editorAdd', 'editorRm', 'boxAdd') and
    param in (select id from boxes where owner_id = old.id);
  return old;
end;
$$;

drop trigger if exists user_msgs_rm on users;
create trigger user_msgs_rm
  before delete on users
  for each row
  execute procedure user_msgs_rm_fn();

-- removing notifications if box was deleted
create or replace function box_msgs_rm_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  delete from notifications where
    type in ('viewerAdd', 'viewerRm', 'editorAdd', 'editorRm', 'boxAdd') and param = old.id;
  return old;
end;
$$;

drop trigger if exists box_msgs_rm on boxes;
create trigger box_msgs_rm
  before delete on boxes
  for each row
  execute procedure box_msgs_rm_fn();
