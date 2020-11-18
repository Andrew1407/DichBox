import boxesController from './boxesController';
import { getMiddlewares } from '../extra';
import { boxesRouters } from '../routesTypes';

const boxesMiddlewares: boxesRouters = getMiddlewares(boxesController);
export default boxesMiddlewares;
