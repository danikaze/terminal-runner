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

  public gameSaved(file: string): void {
    this.logger.info(`Game saved into ${file}`);
  }

  public errorSavingGame(file: string, error: string): void {
    this.logger.error(`Error while saving the game into ${file} (${error})`);
  }

  public gameLoaded(file: string): void {
    this.logger.info(`Game loaded from ${file}`);
  }

  public errorLoadingGame(file: string, error: string): void {
    this.logger.error(`Error while loading the game from ${file} (${error})`);
  }
}
