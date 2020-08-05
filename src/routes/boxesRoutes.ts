import * as express from 'express';
import {
  createBox,
  findUserBoxes
} from '../controllers/boxesController';

const boxesRouter: express.Router = express.Router();

boxesRouter.post('/user_boxes', findUserBoxes);

export default boxesRouter;
