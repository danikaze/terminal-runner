import { init, getLogger } from 'util/logger/server';
import { NsLogger } from 'util/logger';

export class GameLogger {
  private readonly logger: NsLogger;

  constructor() {
    init();
    this.logger = getLogger('global');
    this.logger.info('GameLogger initializated');
  }

  public showLoggerFormats() {
    this.logger.error('0. error msg');
    this.logger.warn('1. warn msg');
    this.logger.info('2. info msg');
    this.logger.verbose('3. verbose msg');
    this.logger.debug('4. debug msg');
  }
}
