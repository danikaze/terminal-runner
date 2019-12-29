import { default as logSystem, NsLogger } from 'util/logger';

export class UiLogger {
  private readonly logger: NsLogger;

  constructor() {
    this.logger = logSystem.getLogger('ui');
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
