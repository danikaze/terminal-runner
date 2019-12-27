import * as Transport from 'winston-transport';

export const SYMBOL_LEVEL = Symbol.for('level');
export const SYMBOL_MESSAGE = Symbol.for('message');

export interface LogData {
  message: string;
  level: string;
  namespace: string;
  timestamp: string;
  [SYMBOL_LEVEL]: string;
  [SYMBOL_MESSAGE]: string;
}

interface WinstonTransportOptions extends Transport.TransportStreamOptions {
  uiLog: (info: LogData) => void;
}

export class WinstonTransport extends Transport {
  private readonly uiLog: (info: LogData) => void;

  constructor(opts: WinstonTransportOptions) {
    super(opts);
    this.uiLog = opts.uiLog;
  }

  public log(info: LogData, next: () => void) {
    this.uiLog(info);
    next();
  }
}
