import * as express from 'express';
import * as routes from '../controllers/userController';

const usersRouter: express.Router = express.Router();

usersRouter.post('/create', routes.signUpUser);
usersRouter.post('/find', routes.findUser);
usersRouter.post('/enter', routes.signInUser);
usersRouter.post('/verify', routes.verifyUserInput);
usersRouter.post('/name', routes.getUsername);
usersRouter.post('/passwd_verify', routes.verifyUserPassword);
usersRouter.post('/edit', routes.editUser);
usersRouter.post('/remove', routes.removeUser);
usersRouter.post('/names_list', routes.findUsernames);

export default usersRouter;
