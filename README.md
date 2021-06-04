# DichBox

<p align="center">
  <a target="blank"><img src="https://raw.githubusercontent.com/Andrew1407/DichBox/main/client/src/styles/imgs/full-logo.png" width="140" alt="DichBox Logo" /></a>
</p>

Storage web-service for editing boxes (storages) and their entries.

**Components**:
  + [container](#container)
  + [server](https://github.com/Andrew1407/DichBox/tree/main/server)
  + [browser client](https://github.com/Andrew1407/DichBox/tree/main/client)
  + [mobile client](https://github.com/Andrew1407/DichBoxMobile)

---

## Container

### Setup

To run DichBox using docker-compose create environment file with fields:
  + **PORT** - app server port
  + **DB_USERNAME** - database owner
  + **DB_PASSWD** - user's password
  + **DB_NAME** - database name

Run test container (and database one) with specified environment file:
> docker-compose -f docker-compose.test.yaml --env-file [environment file path] up --exit-code-from test; docker container rm dichbox_test_1

For example (using .env file from the server):
> docker-compose -f docker-compose.test.yaml --env-file ./server/.env.example up --exit-code-from test; docker container rm dichbox_test_1

---

Run docker-compose with specified environment file:
> docker-compose --env-file [environment file path] up

For example (using .env file from the server):
> docker-compose --env-file ./server/.env.example up

### Versions

**1.0.0** (server v2.0.0, browser client v1.0.1):
  + database and app services;
  + container test;
  + github workflows;
  + documentation;
