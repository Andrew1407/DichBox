import * as express from 'express';
import { Application } from 'express';
import * as cors from 'cors';
import * as bodyparser from 'body-parser';
import usersRouter from './routes/clientRoutes';

const app: Application = express();
app.use(cors());
app.use(bodyparser.json({ limit: '50mb' }))
app.use(bodyparser.urlencoded({
  limit: '50mb',
  extended: true
}));

app.use('/users', usersRouter);

app.listen(7041, '192.168.0.223')
