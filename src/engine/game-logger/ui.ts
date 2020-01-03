import { default as logSystem, NsLogger } from 'util/logger';

export class UiLogger {
  private readonly logger: NsLogger;

  constructor() {
    this.logger = logSystem.getLogger('ui');
  }

  public resized(width: number, height: number): void {
    this.logger.info(
      `UI resized to {yellow-fg}${width}{/yellow-fg}x{yellow-fg}${height}{/yellow-fg}`
    );
  }

  public layoutRuleNotFound(key: string): void {
    this.logger.error(`UI Layout rule not found: {yellow}${key}{/yellow}`);
  }

  public gameEnd(): void {
    this.logger.verbose(
      'Press [{yellow-fg}Esc{/yellow-fg}|{yellow-fg}Q{/yellow-fg}|{yellow-fg}C-c{/yellow-fg}] or execute {yellow-fg}/exit{/yellow-fg} to quit the program...'
    );
  }

  public userSelect<T>(data: T): void {
    this.logger.verbose(`user selects: ${JSON.stringify(data)}`);
  }
}
