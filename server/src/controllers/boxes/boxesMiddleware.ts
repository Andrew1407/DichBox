import boxesController from './boxesController';
import { getMiddlewares } from '../extra';
import { BoxesRoutes } from '../routesTypes';

const boxesMiddlewares: BoxesRoutes = getMiddlewares(boxesController);
export default boxesMiddlewares;
