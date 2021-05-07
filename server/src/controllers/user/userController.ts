import userHandlers from './userHandlers';
import { getWrappedRoutes } from '../extra';
import { UserRoutes } from '../routesTypes';

const userController: UserRoutes = getWrappedRoutes(userHandlers);
export default userController;
