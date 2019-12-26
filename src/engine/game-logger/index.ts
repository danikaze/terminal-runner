import * as Transport from 'winston-transport';
import { default as logSystem, NsLogger, LoggerLevel } from 'util/logger';
import { Story } from 'engine/story';

export class GameLogger {
  private readonly logger: NsLogger;

  constructor() {
    this.logger = logSystem.getLogger('global');
    this.logger.info('GameLogger initializated');
  }

  public static init(extraTransports?: Transport[]) {
    logSystem.init({ transports: extraTransports });
    logger = new GameLogger();
  }

  public showLoggerFormats() {
    this.logger.error('0. error msg');
    this.logger.warn('1. warn msg');
    this.logger.info('2. info msg');
    this.logger.verbose('3. verbose msg');
    this.logger.debug('4. debug msg');
  }

  public msg(level: LoggerLevel, msg: string) {
    this.logger[level](msg);
  }

  public storyLoaded(story: Story): void {
    this.logger.info(`Story loaded: ${story.name}`);
  }

  public errorLoadingStory(errors: string): void {
    this.logger.warn(errors);
  }

  public runningStory(story: Story): void {
    this.logger.info(`Running story: ${story.name}`);
  }
}

export let logger: GameLogger;
