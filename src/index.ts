import DichBoxDB from './database/DichBoxDB';
import * as express from 'express';
import { Application, Request, Response } from 'express';
import * as cors from 'cors';
import * as bodyparser from 'body-parser';

const app: Application = express();
app.use(cors());
app.use(bodyparser.json())

app.get('/', (req: Request, res: Response) => {
  res.sendFile('./view/index.html', { root: __dirname });
});

app.listen(7041, '192.168.0.223')

