import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';

export interface LogOptions {
  screen: blessed.Widgets.Screen;
}

export class Log {
  protected screen: blessed.Widgets.Screen;
  protected logBox: contrib.Widgets.LogElement;
  protected isVisible: boolean = false;

  constructor(options: LogOptions) {
    this.screen = options.screen;
    this.logBox = contrib.log({
      tags: true,
      border: { type: 'line' },
      label: 'Game Log',
      top: 0,
      left: 0,
      height: 10,
    });
    this.screen.key(['`'], () => this.toggle());
  }

  public async show(): Promise<void> {
    this.isVisible = true;
    this.screen.append(this.logBox);
    this.logBox.focus();
    this.screen.render();
  }

  public async hide(): Promise<void> {
    this.isVisible = false;
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
    this.logBox.log(text);
  }
}
