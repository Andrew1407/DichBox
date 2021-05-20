import ILogger from './ILogger';
import LogInfo from './LogInfo';
import * as fs from 'fs';
import { Statuses } from '../controllers/statusInfo';
import Colors from './colors';

export default class Logger implements ILogger {
  private static writable?: fs.WriteStream;
  private currentFile: string;

  static closeWriteStream(): void {
    Logger.writable?.end();
  }

  constructor(
    private readonly dir: string,
    private readonly printable: boolean = false
  ) {
    this.createDirIfNotExists(dir)
      .then((): void => this.handleStream());
  }

  public async log(data: LogInfo): Promise<void> {
    this.handleStream();
    const stringified: string = JSON.stringify(data, null, 2);
    Logger.writable.write(`${stringified},\n`);
    if (!this.printable) return;
    const ok: boolean = data.status === Statuses.OK;
    const created: boolean = data.status === Statuses.CREATED;
    const fg: string = ok || created ? Colors.GREEN : Colors.RED;
    const bg: string = Colors.BLACK;
    const out: string = 
      `${bg}${fg}[${data.date}]\t${data.method}\t${data.status}\t${data.route}`;
    console.log(out + Colors.RESET);
  }

  private handleStream(): void {
    const prefix: string = new Date()
      .toLocaleDateString()
      .replace(/\//g, '-');
    const filename: string = `${this.dir}/${prefix}.log`;
    if (filename == this.currentFile) return;
    this.currentFile = filename;
    Logger.closeWriteStream();
    Logger.writable = fs.createWriteStream(this.currentFile, { flags: 'a+' });
  }

  private async createDirIfNotExists(dirName: string): Promise<void> {
    try {
      await fs.promises.stat(dirName);
    } catch {
      await fs.promises.mkdir(dirName);
    }
  }
}
