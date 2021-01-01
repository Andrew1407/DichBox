import userController from './userController';
import { getMiddlewares } from '../extra';
import { userRouters } from '../routesTypes';

const userMiddlewares: userRouters = getMiddlewares(userController);
export default userMiddlewares;
