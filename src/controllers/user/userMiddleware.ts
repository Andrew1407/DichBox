import userController from './userController';
import { getMiddlewares, userRouters } from '../extra';

const userMiddlewares: userRouters = getMiddlewares(userController);
export default userMiddlewares;
