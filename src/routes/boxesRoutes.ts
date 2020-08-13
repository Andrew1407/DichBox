import * as express from 'express';
import * as routes from '../controllers/boxesController';

const boxesRouter: express.Router = express.Router();

boxesRouter.post('/create', routes.createBox);
boxesRouter.post('/user_boxes', routes.findUserBoxes);
boxesRouter.post('/verify', routes.verifyBoxName);
boxesRouter.post('/details', routes.getBoxDetais);

export default boxesRouter;
