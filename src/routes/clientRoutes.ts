import * as expres from 'express';
import {
  signUpUser,
  findUser,
  signInUser,
  verifyUserInput,
  getUsername,
  verifyUserPassword,
  editUser
} from '../controllers/userController';

const usersRouter: expres.Router = expres.Router();

usersRouter.post('/create', signUpUser);
usersRouter.post('/find', findUser);
usersRouter.post('/enter', signInUser);
usersRouter.post('/verify', verifyUserInput);
usersRouter.post('/name', getUsername)
usersRouter.post('/passwd_verify', verifyUserPassword)
usersRouter.post('/edit', editUser)

export default usersRouter;
