# DichBox server

**Versions:** [Changes list](https://github.com/Andrew1407/DichBox/tree/main/server/changes-list.md)

---

## Setup

Firstly, install dependencies:
> npm i

Create **.env** file ([example](https://github.com/Andrew1407/DichBox/blob/main/server/.env.example)).

Create *DichStorage* directory using path mentioned in *.env* file (STORAGE_PATH) or create default one:
> npm run mkstorage

Run tests:
> npm test

If the server is already running the test just contects to it and executed.
In case when the server isn't running the test creates one instance of it (during tests) and shuts it down after execution.

Run server in development mode:
> npm start

Build *./src* with:
> npm run build

The artefact will be built in *server/dist* directory.

To run the built project use:
> node dist [options]

The flag **--test-worker** (both for dev. mode and built artefact) allows to run initial tests on one worker (and shut the server down if they are failed).

---

Logs output can be specified in *.env* file: directory to write logs and verbose mode.
