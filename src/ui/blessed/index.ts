import * as Transport from 'winston-transport';
import { WinstonTransport, LogData, SYMBOL_MESSAGE } from './winston-transport';
import * as blessed from 'blessed';
import { GameUi, InitData, SelectData, SelectOptions } from 'engine/model/ui';
import { logger } from 'engine/game-logger';
import { Rng } from 'util/rng';
import { Log } from './widgets/log';

export class TerminalUi implements GameUi {
  public gameLog = {
    getTransport: (): Transport => {
      return new WinstonTransport({
        uiLog: this.gameLog.addLog.bind(this),
      });
    },
    show: async (): Promise<void> => {
      return (this.log as Log).show();
    },
    hide: async (): Promise<void> => {
      return (this.log as Log).hide();
    },
    toggle: async (): Promise<void> => {
      return (this.log as Log).toggle();
    },
    addLog: (info: LogData): void => {
      (this.log as Log).addMessage(info[SYMBOL_MESSAGE]);
    },
  };

  private readonly rng: Rng;
  private readonly isDebugModeEnabled: boolean;
  private readonly screen: blessed.Widgets.Screen;

  private readonly log?: Log;

  constructor(data: InitData) {
    this.rng = data.rng;
    this.isDebugModeEnabled = !!data.debug;

    this.screen = blessed.screen({ smartCSR: true });

    this.screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

    if (!this.isDebugModeEnabled) {
      return;
    }

    this.log = new Log(this.screen);
  }

  public async start(): Promise<void> {
    this.screen.render();
  }

  public async end(): Promise<void> {
    if (this.isDebugModeEnabled) {
      if (this.log) {
        logger.msg(
          'debug',
          'Press [{yellow-fg}Esc{/yellow-fg}|{yellow-fg}Q{/yellow-fg}|{yellow-fg}C-c{/yellow-fg}] to exit...'
        );
      }
      return;
    }
    process.exit(0);
  }

  public async userSelect<T>(
    data: NonEmptyArray<SelectData<T>>,
    options?: SelectOptions<T>
  ): Promise<T> {
    return new Promise<T>(resolve => {
      const selectOptions =
        options && options.randomSort ? this.rng.shuffle(data) : data;

      setTimeout(() => {
        const option = this.rng.pick(selectOptions);
        resolve(option && option.data);
        // tslint:disable-next-line: no-magic-numbers
      }, 500);
      this.screen.render();
    });
  }
}
