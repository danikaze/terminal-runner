import * as blessed from 'blessed';
import { clamp } from 'util/clamp';
import { KeyDeclaration, compareKey } from 'ui/blessed/util/keys';

export interface LogOptions {
  /** blessed screen where to render the widget */
  screen: blessed.Widgets.Screen;
  /**
   * Function to call when a command has been input,
   * specifying this enables the command input line
   */
  onInput?: (command: string) => void;
  /** Function to call when the autocomplete key has been triggered */
  onAutocomplete?: (text: string) => string;
}

/**
 * Log acts as a terminal window like the ones in the original Quake.
 * It presents the log messages and also a command input line if enabled.
 */
export class Log {
  /** Minimum size of the Log box (2 lines are for the borders) */
  protected static readonly MIN_SIZE = 5;
  /** When resizing, number of lines to left uncover in the bottom */
  protected static readonly MIN_MARGIN_BOTTOM = 5;
  /** Key used for showing or hiding the Log widget */
  protected static readonly TOGGLE_CHAR = '`';
  /** Key used for cancelling the command input */
  protected static readonly CANCEL_KEY = 'escape';
  /** Key used to trigger the autocomplete function if provided */
  protected static readonly AUTOCOMPLETE_KEY = 'tab';

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

  // command autocompletion
  protected readonly onAutocomplete?: (text: string) => string;

  constructor(options: LogOptions) {
    this.screen = options.screen;
    this.onInput = options.onInput;
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
      this.onAutocomplete = options.onAutocomplete;
      this.inputBox = blessed.textarea({
        height: 1,
        bottom: 0,
        clickable: true,
        style: {
          bg: '#003',
        },
      });
      this.logBox.append(this.inputBox);
      this.inputBox.on('keypress', (char, key) =>
        this.processKeyEvents(char, key, true)
      );

      this.inputBox.key('enter', () => {
        const command = this.inputBox!.getValue().trim();
        this.onInput!(command);
        this.inputBox!.setValue('');
        this.addCommandHistory(command);
      });

      if (this.onAutocomplete) {
        this.inputBox.key(Log.AUTOCOMPLETE_KEY, () => {
          const original = this.inputBox!.getValue().trim();
          const value = this.onAutocomplete!(original);
          if (value) {
            this.inputBox!.setValue(value);
          } else {
            this.inputBox!.setValue(original);
          }
          this.screen.render();
          return false;
        });
      }

      this.inputBox.on('focus', () => {
        this.inputBox!.readInput();
      });
    }

    this.screen.key([Log.TOGGLE_CHAR], () => this.toggle());
  }

  /**
   * Shows the widget
   *
   * @param focused If set to `false`, the widget won't get the focus when displayed
   */
  public async show(focused?: boolean): Promise<void> {
    if (this.isVisible) return;

    this.isVisible = true;
    this.screen.append(this.logBox);
    if (focused !== false) {
      this.screen.saveFocus();
      (this.inputBox ? this.inputBox : this.logBox).focus();
    }
    this.screen.render();
  }

  /**
   * Hides the widget
   */
  public async hide(): Promise<void> {
    if (!this.isVisible) return;

    this.isVisible = false;
    this.screen.restoreFocus();
    this.screen.remove(this.logBox);
    this.screen.render();
  }

  /**
   * Toggles the widget between shown/hidden
   *
   * @param focused If set to `false`, the widget won't get the focus when displayed
   *                (not used when hidden)
   */
  public async toggle(focused?: boolean): Promise<void> {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show(focused);
    }
  }

  /**
   * Adds a text in the log area
   */
  public addMessage(text: string): void {
    if (this.lastLine === this.messages.length) {
      this.lastLine++;
    }
    this.messages.push(text);
    this.updateContent();
  }

  public clear(): void {
    this.messages.splice(0, this.messages.length);
    this.updateContent();
  }

  /**
   * Method that re-renders the widget (log messages) based in the content
   */
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

  /**
   * Change the height of the widget by the specified number of lines
   */
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

  /**
   * Scroll up (<0) or down (>0) the log messages area by the specified number of lines
   */
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

  /**
   * Navigate between the history of commands by the specified number of commands,
   * being -1 the previous one, and +1 the next one
   */
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

  /**
   * Add a command to the list of command history
   */
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
    key: blessed.Widgets.Events.IKeyEventArg,
    fromInputBox?: boolean
  ): boolean {
    if (compareKey(Log.keyDefTerminalExpand, char, key)) {
      this.updateSize(1);
      return false;
    }

    if (compareKey(Log.keyDefTerminalShrink, char, key)) {
      this.updateSize(-1);
      return false;
    }

    if (compareKey(Log.keyDefScrollUp, char, key)) {
      this.scroll(-1);
      return false;
    }

    if (compareKey(Log.keyDefScrollDown, char, key)) {
      this.scroll(1);
      return false;
    }

    if (compareKey(Log.keyDefCommandHistoryPrev, char, key)) {
      this.selectCommandHistory(-1);
      return false;
    }

    if (compareKey(Log.keyDefCommandHistoryNext, char, key)) {
      this.selectCommandHistory(1);
      return false;
    }

    if (
      fromInputBox &&
      (char === Log.TOGGLE_CHAR || key.name === Log.CANCEL_KEY)
    ) {
      this.inputBox!.cancel();
      this.hide();
    }

    return true;
  }
}
