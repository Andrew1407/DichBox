import LogInfo from '../../logger/LogInfo';

export const testLogs: LogInfo[] = [
  {
    date: '30/05/2021, 17:34:06',
    method: 'GET',
    route: '/',
    status: 200
  },
  {
    date: '30/05/2021, 17:36:45',
    method: 'POST',
    route: '/test',
    status: 404,
    errorMessage: 'Not found'
  },
  {
    date: '30/06/2021, 17:46:00',
    method: 'POST',
    route: '/test/test2',
    status: 500,
    errorMessage: 'Something internal',
    errorMessageInternal: 'Details weren\'t given'
  }
];
