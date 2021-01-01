import * as express from 'express';
import * as path from 'path';

export const viewPath: string = path.join(__dirname, '..', 'dist', 'view');

export const getViewHandler = (_: express.Request, res: express.Response): void => {
  const root: string = viewPath;
  const viewEntry: string = 'index.html';
  res.sendFile(viewEntry, { root });
};
