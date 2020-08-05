import * as express from 'express';
import {
  signUpUser,
  findUser,
  signInUser,
  verifyUserInput,
  getUsername,
  verifyUserPassword,
  editUser,
  removeUser
} from '../controllers/userController';

const usersRouter: express.Router = express.Router();

usersRouter.post('/create', signUpUser);
usersRouter.post('/find', findUser);
usersRouter.post('/enter', signInUser);
usersRouter.post('/verify', verifyUserInput);
usersRouter.post('/name', getUsername);
usersRouter.post('/passwd_verify', verifyUserPassword);
usersRouter.post('/edit', editUser);
usersRouter.post('/remove', removeUser);

export default usersRouter;
