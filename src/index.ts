import * as express from 'express';
import { Application, Request, Response } from 'express';

const app: Application = express();

app.get('/', (req: Request, res: Response) => {
  res.json({ a: 'dich-server'});
  res.end()
});

app.listen(7041, '192.168.0.223')

