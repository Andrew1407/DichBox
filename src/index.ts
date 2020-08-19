import * as express from 'express';
import { Application } from 'express';
import * as cors from 'cors';
import * as bodyparser from 'body-parser';
import usersRouter from './routes/userRoutes';
import boxesRoutes from './routes/boxesRoutes';

const app: Application = express();
app.use(cors());
app.use(bodyparser.json({ limit: '100mb' }))
app.use(bodyparser.urlencoded({
  limit: '100mb',
  extended: true
}));

app.use('/users', usersRouter);
app.use('/boxes', boxesRoutes);

app.listen(7041, '192.168.0.223')
