import { default as logSystem, NsLogger } from 'util/logger';

export class GameSystemLogger {
  private readonly logger: NsLogger;

  constructor() {
    this.logger = logSystem.getLogger('game');
  }

  public start(): void {
    this.logger.info(`Game starting`);
  }

  public end(): void {
    this.logger.info(`Game ending`);
  }
}
