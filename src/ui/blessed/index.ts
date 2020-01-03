import * as Transport from 'winston-transport';
import { WinstonTransport, LogData, SYMBOL_MESSAGE } from './winston-transport';
import * as blessed from 'blessed';
import { GameUi, InitData, SelectData, SelectOptions } from 'engine/model/ui';
import { Game } from 'engine/game';
import { logger } from 'engine/game-logger';
import { Log } from './widgets/log';
import { autocompleteCommand, processCommand } from './commands';
import { Select } from './widgets/select';
import { TypewriterText } from './widgets/typewriter-text';

export class TerminalUi implements GameUi {
  public gameLog = {
    getTransport: (): Transport => {
      return new WinstonTransport({
        uiLog: this.gameLog.addLog.bind(this),
      });
    },
    show: async (): Promise<void> => {
      return this.log.show();
    },
    hide: async (): Promise<void> => {
      return this.log.hide();
    },
    toggle: async (): Promise<void> => {
      return this.log.toggle();
    },
    addLog: (info: LogData): void => {
      this.log.addMessage(info[SYMBOL_MESSAGE]);
    },
  };

  protected readonly game: Game;
  private readonly isDebugModeEnabled: boolean;
  private readonly screen: blessed.Widgets.Screen;

  private readonly log: Log;

  constructor(data: InitData) {
    this.game = data.game;
    this.isDebugModeEnabled = !!data.debug;

    this.screen = blessed.screen({ smartCSR: true });

    this.screen.key(['escape', 'q', 'C-c'], this.game.quit);

    this.log = new Log({
      x: 0,
      y: 0,
      width: this.screen.width as number,
      height: 10,
      screen: this.screen,
      onInput: this.isDebugModeEnabled
        ? command => {
            const trimmedCommand = command.trim();
            if (!trimmedCommand) {
              return;
            }
            processCommand(trimmedCommand, this.log!, this.game);
          }
        : undefined,
      onAutocomplete: text => autocompleteCommand(text, this.log!, this.game),
    });
    if (this.isDebugModeEnabled) {
      this.log.show(false);
    }
  }

  public async start(): Promise<void> {
    this.screen.render();
  }

  public async end(): Promise<void> {
    if (this.isDebugModeEnabled) {
      if (this.log) {
        logger.ui.gameEnd();
      }
      return;
    }
    process.exit(0);
  }

  public userSelect<T>(
    data: NonEmptyArray<SelectData<T>>,
    options?: SelectOptions<T>
  ): Promise<T> {
    return new Promise<T>(resolve => {
      const items =
        options && options.randomSort ? this.game.rng.shuffle(data) : data;

      new Select({
        x: 0,
        y: (this.screen.height as number) - items.length,
        width: this.screen.width as number,
        height: items.length,
        text: options && options.text,
        items: items as NonEmptyArray<SelectData<T>>,
        screen: this.screen,
        selected: options && options.selected,
        timeLimit: options && options.timeLimit,
        onSelect: data => {
          logger.ui.userSelect(data);
          resolve(data);
        },
      });
    });
  }

  public text(text: string): Promise<void> {
    return new Promise<void>(resolve => {
      new TypewriterText({
        text,
        screen: this.screen,
        x: 0,
        y: 12,
        width: this.screen.width as number,
        height: 10,
        onDone: resolve,
      });
    });
  }
}
