import boxesController from './boxesController';
import { getMiddlewares } from '../extra';
import { boxesRoutes } from '../routesTypes';

const boxesMiddlewares: boxesRoutes = getMiddlewares(boxesController);
export default boxesMiddlewares;
