import * as blessed from 'blessed';
import { clamp } from 'util/clamp';
import { KeyDeclaration, compareKey } from 'ui/blessed/util/keys';

export interface LogOptions {
  screen: blessed.Widgets.Screen;
  onInput?: (command: string) => void;
  toggleChar?: string;
}

export class Log {
  /** Minimum size of the Log box (2 lines are for the borders) */
  protected static readonly MIN_SIZE = 5;
  /** When resizing, number of lines to left uncover in the bottom */
  protected static readonly MIN_MARGIN_BOTTOM = 5;

  protected static readonly keyDefScrollUp: KeyDeclaration = {
    key: 'up',
    shift: false,
    ctrl: false,
  };
  protected static readonly keyDefScrollDown: KeyDeclaration = {
    key: 'down',
    shift: false,
    ctrl: false,
  };
  protected static readonly keyDefTerminalExpand: KeyDeclaration = {
    key: 'down',
    shift: true,
    ctrl: false,
  };
  protected static readonly keyDefTerminalShrink: KeyDeclaration = {
    key: 'up',
    shift: true,
    ctrl: false,
  };
  protected static readonly keyDefCommandHistoryPrev: KeyDeclaration = {
    key: 'up',
    shift: false,
    ctrl: true,
  };
  protected static readonly keyDefCommandHistoryNext: KeyDeclaration = {
    key: 'down',
    shift: false,
    ctrl: true,
  };

  protected readonly screen: blessed.Widgets.Screen;
  protected readonly onInput?: (command: string) => void;
  protected readonly toggleChar: string;
  protected isVisible: boolean = false;

  // blessed elements
  protected readonly logBox: blessed.Widgets.TextElement;
  protected readonly inputBox?: blessed.Widgets.TextareaElement;

  // log messages related variables
  protected readonly messages: string[] = [];
  protected lastLine = 0;

  // command history related variables
  protected readonly commandHistory: string[] = [];
  protected commandIndex = 0;
  protected commandBuffer = '';

  constructor(options: LogOptions) {
    this.screen = options.screen;
    this.onInput = options.onInput;
    this.toggleChar = options.toggleChar || '`';
    this.logBox = blessed.text({
      tags: true,
      border: { type: 'line' },
      label: 'Game Log',
      top: 0,
      left: 0,
      width: '100%',
      height: 10,
      clickable: true,
    });

    this.logBox.on('keypress', this.processKeyEvents.bind(this));

    if (this.onInput) {
      this.inputBox = blessed.textarea({
        height: 1,
        bottom: 0,
        clickable: true,
        style: {
          bg: '#003',
        },
      });
      this.logBox.append(this.inputBox);
      this.inputBox.on('keypress', (char, key) => {
        if (!this.processKeyEvents(char, key)) {
          return;
        }

        if (key.name === 'enter') {
          const command = this.inputBox!.getValue().trim();
          this.onInput!(command);
          this.inputBox!.setValue('');
          this.addCommandHistory(command);
        } else if (char === this.toggleChar || key === 'escape') {
          this.inputBox!.cancel();
          this.hide();
        }
      });
      this.inputBox.on('focus', () => {
        this.inputBox!.readInput();
      });
    }

    this.screen.key([this.toggleChar], () => this.toggle());
  }

  public async show(): Promise<void> {
    this.isVisible = true;
    this.screen.append(this.logBox);
    (this.inputBox ? this.inputBox : this.logBox).focus();
    this.screen.render();
  }

  public async hide(): Promise<void> {
    this.isVisible = false;
    this.screen.restoreFocus();
    this.screen.remove(this.logBox);
    this.screen.render();
  }

  public async toggle(): Promise<void> {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public addMessage(text: string): void {
    if (this.lastLine === this.messages.length) {
      this.lastLine++;
    }
    this.messages.push(text);
    this.updateContent();
  }

  protected updateContent(): void {
    const lines =
      (this.logBox.height as number) -
      (this.inputBox ? (this.inputBox.height as number) : 0) -
      2; // borders
    const text = this.messages
      .slice(Math.max(0, this.lastLine - lines), this.lastLine)
      .join('\n');
    this.logBox.content = text;
    if (this.isVisible) {
      this.screen.render();
    }
  }

  protected updateSize(delta: number): void {
    const oldSize = this.logBox.height as number;

    this.logBox.height = clamp(
      (this.logBox.height as number) + delta,
      Log.MIN_SIZE,
      (this.screen.height as number) - Log.MIN_MARGIN_BOTTOM
    );

    if (oldSize === this.logBox.height) {
      return;
    }
    this.scroll(0, true);
  }

  protected scroll(delta: number, force?: boolean): void {
    const oldLastLine = this.lastLine;
    const maxLine = this.messages.length;
    const minLine = Math.min(
      (this.logBox.height as number) -
        (this.inputBox ? (this.inputBox.height as number) : 0) -
        2,
      maxLine
    );

    this.lastLine = clamp(oldLastLine + delta, minLine, maxLine);

    if (oldLastLine === this.lastLine && !force) {
      return;
    }
    this.updateContent();
  }

  protected selectCommandHistory(delta: number): void {
    const nCommands = this.commandHistory.length;
    // if it's currently editing, save the buffer
    if (this.commandIndex === nCommands) {
      this.commandBuffer = this.inputBox!.getValue();
    }
    this.commandIndex = clamp(this.commandIndex + delta, 0, nCommands);
    this.inputBox!.setValue(
      this.commandHistory[this.commandIndex] || this.commandBuffer
    );
    this.screen.render();
  }

  protected addCommandHistory(command: string): void {
    if (!command) return;

    const nCommands = this.commandHistory.length;
    if (this.commandHistory[nCommands - 1] !== command) {
      this.commandHistory.push(command);
      this.commandIndex = nCommands + 1;
    }
  }

  /**
   * Process the key events.
   * Returns `false` if handled to prevent event bubbling
   */
  protected processKeyEvents(
    char: string,
    key: blessed.Widgets.Events.IKeyEventArg
  ): boolean {
    if (compareKey(Log.keyDefTerminalExpand, char, key)) {
      this.updateSize(1);
    } else if (compareKey(Log.keyDefTerminalShrink, char, key)) {
      this.updateSize(-1);
    } else if (compareKey(Log.keyDefScrollUp, char, key)) {
      this.scroll(-1);
    } else if (compareKey(Log.keyDefScrollDown, char, key)) {
      this.scroll(1);
    } else if (compareKey(Log.keyDefCommandHistoryPrev, char, key)) {
      this.selectCommandHistory(-1);
    } else if (compareKey(Log.keyDefCommandHistoryNext, char, key)) {
      this.selectCommandHistory(1);
    }

    return true;
  }
}
