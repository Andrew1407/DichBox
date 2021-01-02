import userController from './userController';
import { getMiddlewares } from '../extra';
import { userRoutes } from '../routesTypes';

const userMiddlewares: userRoutes = getMiddlewares(userController);
export default userMiddlewares;
