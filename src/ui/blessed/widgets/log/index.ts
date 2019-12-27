import * as blessed from 'blessed';
import { clamp } from 'util/clamp';

export interface LogOptions {
  screen: blessed.Widgets.Screen;
}

export class Log {
  /** Minimum size of the Log box (2 lines are for the borders) */
  protected static readonly MIN_SIZE = 5;
  /** When resizing, number of lines to left uncover in the bottom */
  protected static readonly MIN_MARGIN_BOTTOM = 5;

  protected readonly screen: blessed.Widgets.Screen;
  protected readonly logBox: blessed.Widgets.TextElement;
  protected readonly messages: string[] = [];
  protected lastLine = 0;
  protected isVisible: boolean = false;

  constructor(options: LogOptions) {
    this.screen = options.screen;
    this.logBox = blessed.text({
      tags: true,
      border: { type: 'line' },
      label: 'Game Log',
      top: 0,
      left: 0,
      width: '100%',
      height: 10,
    });

    this.logBox.on('keypress', (char, key) => {
      if (char === '-' || char === '+') {
        this.updateSize(char === '-' ? -1 : 1);
      } else if (key.name === 'up' || key.name === 'down') {
        this.scroll(key.name === 'up' ? -1 : 1);
      }
    });

    this.screen.key(['`'], () => this.toggle());
  }

  public async show(): Promise<void> {
    this.isVisible = true;
    this.screen.append(this.logBox);
    this.screen.saveFocus();
    this.logBox.focus();
    (this.logBox.parent as blessed.Widgets.Screen).render();
  }

  public async hide(): Promise<void> {
    const parent = this.logBox.parent as blessed.Widgets.Screen;
    this.isVisible = false;
    this.screen.restoreFocus();
    this.screen.remove(this.logBox);
    parent.render();
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
    const lines = (this.logBox.height as number) - 2;
    const text = this.messages
      .slice(Math.max(0, this.lastLine - lines), this.lastLine)
      .join('\n');
    this.logBox.content = text;
    if (this.isVisible) {
      (this.logBox.parent as blessed.Widgets.Screen).render();
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
    const minLine = Math.min((this.logBox.height as number) - 2, maxLine);

    this.lastLine = clamp(oldLastLine + delta, minLine, maxLine);

    if (oldLastLine === this.lastLine && !force) {
      return;
    }
    this.updateContent();
  }
}
