import LogInfo from './LogInfo';

export default interface ILogger {
  log(data: LogInfo): Promise<void>;
}
