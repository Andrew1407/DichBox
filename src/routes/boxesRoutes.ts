import { Router } from 'express';
import * as routes from '../controllers/boxesController';

const boxesRouter: Router = Router();

boxesRouter
  .post('/create', routes.createBox)
  .post('/user_boxes', routes.findUserBoxes)
  .post('/verify', routes.verifyBoxName)
  .post('/details', routes.getBoxDetais)
  .post('/edit', routes.editBox)
  .post('/remove', routes.removeBox)
  .post('/files/list', routes.getPathFiles)
  .post('/files/create', routes.createFile)
  .post('/files/save', routes.saveFile)
  .post('/files/get', routes.getFile);

export default boxesRouter;
