import * as Transport from 'winston-transport';
import { default as logSystem, NsLogger, LoggerLevel } from 'util/logger';
import { GameSystemLogger } from './game';
import { StoryLogger } from './story';

export class GameLogger {
  public readonly global: NsLogger;
  public readonly game: GameSystemLogger;
  public readonly story: StoryLogger;

  constructor() {
    this.global = logSystem.getLogger('global');
    this.game = new GameSystemLogger();
    this.story = new StoryLogger();
    this.global.info('GameLogger initializated');
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
