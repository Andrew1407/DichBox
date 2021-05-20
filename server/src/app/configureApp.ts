import * as express from 'express';
import * as cors from 'cors';
import usersRouter from '../routes/userRoutes';
import boxesRouter from '../routes/boxesRoutes';
import { viewPath, getViewHandler } from '../view';

const configureApp = (app: express.Application): void => {
  const limit: string = '100mb';
  app
    .use(cors())
    .use(express.json({ limit }))
    .use(express.urlencoded({ limit, extended: true }))
    .use(express.static(viewPath))
    .use('/users', usersRouter)
    .use('/boxes', boxesRouter)
    .get('*', getViewHandler);
};

export default configureApp;
