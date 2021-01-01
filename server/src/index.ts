import * as express from 'express';
import * as cors from 'cors';
import * as bodyparser from 'body-parser';
import * as dotenv from 'dotenv';
import usersRouter from './routes/userRoutes';
import boxesRouter from './routes/boxesRoutes';
import { viewPath, getViewHandler } from './view';

dotenv.config();
const PORT: number = Number(process.env.PORT) || 7041;
const HOST: string = process.env.HOST || 'localhost';
const app: express.Application = express();
app.use(cors());
app.use(bodyparser.json({ limit: '100mb' }))
app.use(bodyparser.urlencoded({
  limit: '100mb',
  extended: true
}));
app.use(express.static(viewPath));

app.use('/users', usersRouter);
app.use('/boxes', boxesRouter);
app.get('*', getViewHandler);

app.listen(PORT, HOST);
