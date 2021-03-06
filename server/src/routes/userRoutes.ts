import { Router } from 'express';
import routes from '../controllers/user/userController';

const usersRouter: Router = Router();

usersRouter
  .post('/identify', routes.findUsername)
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
  .post('/search', routes.searchUsers)
  .post('/notifications_list', routes.getNotifications)
  .post('/notifications_remove', routes.removeNotifications);

export default usersRouter;
