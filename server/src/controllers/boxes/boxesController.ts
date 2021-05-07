import boxesHandlers from './boxesHandlers';
import { getWrappedRoutes } from '../extra';
import { BoxesRoutes } from '../routesTypes';

const boxesController: BoxesRoutes = getWrappedRoutes(boxesHandlers);
export default boxesController;
