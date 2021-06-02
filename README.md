# DichBox

Storage web-service for editing boxes (storages) and their entries.

**Components**:
  + [container](#container)
  + [server](https://github.com/Andrew1407/DichBox/tree/main/server)
  + [browser client](https://github.com/Andrew1407/DichBox/tree/main/client)
  + [mobile client](https://github.com/Andrew1407/DichBoxMobile-)

---

## Container

#### Setup

To run DichBox using docker-compose create environment file with fields:
  + **PORT** - app server port
  + **DB_USERNAME** - database owner
  + **DB_PASSWD** - user's password
  + **DB_NAME** - database name

Run test container (and database one) with specified environment file:
> docker-compose -f docker-compose.test.yaml --env-file [environment file path] up --exit-code-from test

For example (using variable for the server):
> docker-compose -f docker-compose.test.yaml --env-file ./server/.env.example up --exit-code-from test

---

Run docker-compose with specified environment file:
> docker-compose --env-file [environment file path] up

For example (using variable for the server):
> docker-compose --env-file ./server/.env.example up
