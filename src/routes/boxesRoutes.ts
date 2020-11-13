import { Router } from 'express';
import routes from '../controllers/boxes/boxesMiddleware';

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
  .post('/files/save', routes.saveFiles)
  .post('/files/get', routes.getFile)
  .post('/files/remove', routes.removeFile)
  .post('/files/rename', routes.renameFile);

export default boxesRouter;
