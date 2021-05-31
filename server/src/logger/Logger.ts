import * as fs from 'fs';
import ILogger from './ILogger';
import LogInfo from './LogInfo';
import { Statuses } from '../controllers/statusInfo';
import Colors from './colors';

export default class Logger implements ILogger {
  protected static writable: fs.WriteStream;
  private currentFile: string;

  static closeWriteStream(): void {
    Logger.writable?.end();
    Logger.writable = null;
  }

  constructor(
    private readonly dir: string,
    private readonly printable: boolean = false
  ) { this.handleStream() }

  public async log(data: LogInfo): Promise<void> {
    await this.handleStream();
    const stringified: string = JSON.stringify(data, null, 2);
    Logger.writable?.write(`${stringified},\n`);
    if (!this.printable) return;
    const ok: boolean = data.status === Statuses.OK;
    const created: boolean = data.status === Statuses.CREATED;
    const fg: string = ok || created ? Colors.FG_GREEN : Colors.FG_RED;
    const bg: string = Colors.BG_BLACK;
    const out: string = 
      `${bg}${fg}[${data.date}]\t${data.method}\t${data.status}\t${data.route}`;
    console.log(out + Colors.RESET);
  }

  private async handleStream(): Promise<void> {
    const prefix: string = new Date()
      .toLocaleDateString()
      .replace(/\//g, '-');
    const filename: string = `${this.dir}/${prefix}.log`;
    const sameFile: boolean = filename === this.currentFile;
    if (Logger.writable && sameFile) return;
    this.currentFile = filename;
    Logger.closeWriteStream();
    await this.createDirIfNotExists();
    Logger.writable = fs.createWriteStream(
      this.currentFile, { flags: 'a+' }
    );
  }

  private async createDirIfNotExists(): Promise<void> {
    const exists: boolean = await fs.promises.stat(this.dir)
      .then((): boolean => true)
      .catch((): boolean => false);
    const parallelStub = (): void => undefined;
    if (!exists) await fs.promises.mkdir(this.dir).catch(parallelStub);
  }
}
