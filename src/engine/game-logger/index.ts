import * as Transport from 'winston-transport';
import { default as logSystem, NsLogger, LoggerLevel } from 'util/logger';
import { GameSystemLogger } from './game';
import { StoryLogger } from './story';
import { UiLogger } from './ui';

export class GameLogger {
  public readonly global: NsLogger;
  public readonly data: NsLogger;
  public readonly game = new GameSystemLogger();
  public readonly story = new StoryLogger();
  public readonly ui = new UiLogger();

  constructor() {
    this.global = logSystem.getLogger('global');
    this.data = logSystem.getLogger('data');
    this.global.info('GameLogger initializated');
    this.global.verbose(
      `Running version {yellow-fg}${APP_VERSION}{/yellow-fg} built from ` +
        `branch {blue-fg}${GIT_BRANCH}{/blue-fg}:{green-fg}${GIT_VERSION}{/green-fg}`
    );
  }

  public static init(extraTransports?: Transport[]) {
    if (logger) {
      logger.loggerAlreadyInitialized();
      return;
    }

    logSystem.init({
      console: false,
      transports: extraTransports,
    });
    logger = new GameLogger();
  }

  public showLoggerFormats() {
    this.global.error('0. error msg');
    this.global.warn('1. warn msg');
    this.global.info('2. info msg');
    this.global.verbose('3. verbose msg');
    this.global.debug('4. debug msg');
  }

  public msg(level: LoggerLevel, msg: string) {
    this.global[level](msg);
  }

  protected loggerAlreadyInitialized() {
    this.global.warn('Logger was already initialized');
  }
}

export let logger: GameLogger;
