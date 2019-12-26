/*
 * Server side implementation of the Logger interface
 */
import { createLogger, transports, format, Logger as Winston } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { NsLogger, LoggerOptions, defaultOptions } from '.';

const customFormat = format.printf(
  ({ level, message, timestamp, namespace }) => {
    return `${
      timestamp ? `${timestamp} ` : ''
    }[${level} | ${namespace}] ${message}`;
  }
);

let instance: Winston;
const nsLoggers: { [namespace: string]: NsLogger } = {};

export function init(options?: Partial<LoggerOptions>): void {
  if (instance) {
    return;
  }

  const opt = {
    ...defaultOptions,
    ...options,
  };

  const winstonTransports = opt.transports || [];

  if (opt.console) {
    winstonTransports.push(new transports.Console());
  }

  if (opt.outputFile) {
    winstonTransports.push(new DailyRotateFile(opt.outputFile));
  }

  instance = createLogger({
    silent: opt.silent,
    level: opt.level,
    transports: winstonTransports,
    format: format.combine(
      format.colorize({ colors: { debug: 'magenta' } }),
      format.timestamp(),
      customFormat
    ),
  });
}

export function getLogger(namespace: string): NsLogger {
  // Since this function can be called several times for a logger,
  // the result is cached to avoid creating the same functions several times
  if (nsLoggers[namespace]) {
    return nsLoggers[namespace];
  }

  const logMessage = (level: string, message: string): void => {
    instance.log({ message, level, namespace });
  };

  nsLoggers[namespace] = {
    error: logMessage.bind(null, 'error'),
    warn: logMessage.bind(null, 'warn'),
    info: logMessage.bind(null, 'info'),
    verbose: logMessage.bind(null, 'verbose'),
    debug: logMessage.bind(null, 'debug'),
  };

  return nsLoggers[namespace];
}
