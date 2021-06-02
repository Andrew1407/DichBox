# Versions history

**0.0.1**:
  + class for database queries (dao);
  + environment setup;
  + database handlers for box and users;

**0.1.0**:
  + user routes;
  + user request parameters;
  + updating user profile;
  + storage manager (raw);
  + boxes route;
  + managing users and boxes db values;
  + /boxes/details route;
  + join/double join methods for db;
  + storage managers, user boxes directories isolated;
  + edit box;
  + /boxes/files route, boxes entries handler;
  + subscriptions;
  + edited fields saving;
  + search users, subscriptions;
  + remove/rename files;
  + validators, password hashing;

**0.1.1**:
  + triggers, notifications;
  + image storage;
  + error handling;
  + controllers dividing (extra tools, handlers);
  + status info;

**1.0.0**:
  + controllers types (boxes and users);
  + sign in (controllers) handling errors: 400, 404;
  + helloMsg filling (notification);
  + database column editing;
  + webpack environment, config editing;

**1.0.1**:
  + directories managing;
  + setting up storage path (.env variable);
  + view handler (raw);
  + database fixed (subscriptions);
  + date formatters for controllers;

**1.1.0**:
  + extended sql model;
  + package initial script;
  + on close db pool method;
  + types edited;

**1.1.1**:
  + interfaces;
  + tests (raw);

**1.2.0**:
  + additional tests;
  + renamed types;
  + validators fixed (string type check);

**1.2.1**:
  + database, file system and routes tests;
  + server app directory;
  + express app configuring;
  + server class;

**1.3.0**:
  + onExit handling for the test worker;
  + clientDB singleton;
  + factory for controllers objects;
  + query pool handling;
  + bug fixes;
  + --test-worker flag;

**1.3.1**:
  + notifications cleanup after box/user removing;
  + user request body null check;
  + description editing empty string fixed;

**1.3.2**:
  + unsigned user search;
  + requests body minimized;
  + bug fixes;

**1.4.0**:
  + enum collections;
  + routes handlers renamed;
  + uuid verification, /identify route, linked triggers;

**1.5.0**:
  + bug fixes (user data);

**1.5.1**:
  + extended name regex;
  + bug fixes;
  + formatting sql search;

**1.5.2**:
  + deprecated bodyparser removed;
  + logger;
  + logger tests;
  + fixed server shutdown;

**1.6.0**:
  + health check;
  + separate test entry;

**2.0.0**:
  + container-oriented tests;
  + storage and sql script adapted for container;
