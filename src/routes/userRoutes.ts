import { Router } from 'express';
import * as routes from '../controllers/userController';

const usersRouter: Router = Router();

usersRouter
  .post('/create', routes.signUpUser)
  .post('/find', routes.findUser)
  .post('/enter', routes.signInUser)
  .post('/verify', routes.verifyUserInput)
  .post('/passwd_verify', routes.verifyUserPassword)
  .post('/edit', routes.editUser)
  .post('/remove', routes.removeUser)
  .post('/names_list', routes.findUsernames)
  .post('/access_lists', routes.getAccessLists)
  .post('/subs_list', routes.getSubscriptions)
  .post('/subscription', routes.subscription)
  .post('/search', routes.searchUsers);

export default usersRouter;
