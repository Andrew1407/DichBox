export default interface IServer {
  start(initTests: boolean, clb?: () => void): void;
  gracefulShutdown(clb?: () => void): void;
};
