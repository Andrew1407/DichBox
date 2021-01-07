import userController from './userController';
import { getMiddlewares } from '../extra';
import { UserRoutes } from '../routesTypes';

const userMiddlewares: UserRoutes = getMiddlewares(userController);
export default userMiddlewares;
