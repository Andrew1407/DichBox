import * as express from 'express';
import { Application } from 'express';
import * as cors from 'cors';
import * as bodyparser from 'body-parser';
import router from './routes/clientRoutes';

const app: Application = express();
app.use(cors());
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use('/', router);

app.listen(7041, '192.168.0.223')
