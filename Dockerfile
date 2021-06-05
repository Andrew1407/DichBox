FROM node:14

WORKDIR /app

COPY . .

RUN cd client && npm i -s \
  && cp .env.example .env \
  && npm run build \
  && cd ../server && npm i -s \
  && npm run mkstorage \
  && cp .env.example .env \
  && npm run build \
  && chmod +x ../await-fulfilled.sh

WORKDIR /app/server

CMD [ "../await-fulfilled.sh", "postgres:5432", "--", "node", "dist" ]
