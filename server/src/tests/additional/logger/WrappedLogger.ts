import ILogger from '../../../logger/ILogger';
import Logger from '../../../logger/Logger';

export default class WrappedLogger extends Logger implements ILogger {
  static getStreamPath(): string|null {
    return Logger.writable?.path?.toString() || null;
  }
}
