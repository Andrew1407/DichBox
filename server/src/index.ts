import * as express from 'express';
import { Application } from 'express';
import * as cors from 'cors';
import * as bodyparser from 'body-parser';
import * as dotenv from 'dotenv';
import usersRouter from './routes/userRoutes';
import boxesRoutes from './routes/boxesRoutes';

dotenv.config();
const PORT: number = Number(process.env.PORT) || 7041;
const HOST: string = process.env.HOST || 'localhost';
const app: Application = express();
app.use(cors());
app.use(bodyparser.json({ limit: '100mb' }))
app.use(bodyparser.urlencoded({
  limit: '100mb',
  extended: true
}));

app.use('/users', usersRouter);
app.use('/boxes', boxesRoutes);

app.listen(PORT, HOST);
