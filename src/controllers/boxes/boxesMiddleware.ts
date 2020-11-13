import boxesController from './boxesController';
import { getMiddlewares, boxesRouters } from '../extra';

const boxesMiddlewares: boxesRouters = getMiddlewares(boxesController);
export default boxesMiddlewares;
