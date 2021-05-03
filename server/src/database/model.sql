drop database if exists dich_box;
create database dich_box;

-- enter the database
\c dich_box 

-- users' data
create table users (
  id serial primary key,
  name varchar(40) not null,
  name_color varchar(8) default '#00d9ff',
  email varchar(50) not null,
  passwd varchar(65) not null,
  followers int default 0,
  reg_date timestamp default now(),
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

-- users's notifications
create table notifications (
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
create table boxes (
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

-- remove user as subscription (trigger)
create function rm_user_subs_fn()
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

create trigger rm_user_subs
  before delete on users
  for each row
  execute procedure rm_user_subs_fn();

-- NOTIFICATIONS TRIGGERS

-- box creating (for followers)
create function notify_box_add_fn()
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

create trigger notify_box_add
  after insert on boxes
  for each row
  execute procedure notify_box_add_fn();

-- adding box viewer
create function notify_viewer_add_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  insert into notifications (person_id, type, param) values (new.person_id, 'viewerAdd', new.box_id);
  return new;
end;
$$;

create trigger notify_viewer_add
  after insert on limited_viewers
  for each row
  execute procedure notify_viewer_add_fn();

-- removing box viewer
create function notify_viewer_rm_fn()
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

create trigger notify_viewer_rm
  before delete on limited_viewers
  for each row
  execute procedure notify_viewer_rm_fn();

-- adding box editor
create function notify_editor_add_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  insert into notifications (person_id, type, param) values (new.person_id, 'editorAdd', new.box_id);    
  return new;
end;
$$;

create trigger notify_editor_add
  after insert on box_editors
  for each row
  execute procedure notify_editor_add_fn();

-- removing box editor
create function notify_editor_rm_fn()
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

create trigger notify_editor_rm
  before delete on box_editors
  for each row
  execute procedure notify_editor_rm_fn();

-- hello message for signed user
create function hello_msg_signed_fn()
  returns trigger
  language plpgsql
  as
$$
begin
  insert into notifications (person_id, type) values (new.id, 'helloMsg');
  return new;
end;
$$;

create trigger hello_msg_signed_fn
  after insert on users
  for each row
  execute procedure hello_msg_signed_fn();

-- removing notifications if user was deleted
create function user_msgs_rm_fn()
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

create trigger user_msgs_rm
  before delete on users
  for each row
  execute procedure user_msgs_rm_fn();

-- removing notifications if box was deleted
create function box_msgs_rm_fn()
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

create trigger box_msgs_rm
  before delete on boxes
  for each row
  execute procedure box_msgs_rm_fn();
