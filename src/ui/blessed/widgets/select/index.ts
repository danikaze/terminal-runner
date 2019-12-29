import * as blessed from 'blessed';
import { TimeBar } from '../time-bar';

export interface SelectData<T> {
  /** Text to display as an option */
  text: string;
  /** Data to return if selected */
  data: T;
  /** If `false` will be displayed as disabled */
  enabled?: boolean;
}

export interface SelectOptions<T> {
  /** Blessed screen where to render the widget */
  screen: blessed.Widgets.Screen;
  /** List of options to present */
  items: NonEmptyArray<SelectData<T>>;
  /** Function called when an option has been selected */
  onSelect: (data: T) => void;
  /** Text to show with the options as a prompt */
  text?: string;
  /** Pre-selected option. By default will be the first one */
  selected?: T;
  /** If specified (ms.), option will be autoselected after this time */
  timeLimit?: number;
}

/**
 * Select shows a list of options allowing to navigate and choose between them
 */
export class Select<T> {
  protected readonly screen: blessed.Widgets.Screen;
  protected readonly items: SelectData<T>[];
  protected readonly onSelect: (data: T) => void;
  protected currentIndex: number = 0;

  // blessed widgets
  protected readonly listBox: blessed.Widgets.ListElement;
  protected readonly textBox?: blessed.Widgets.TextElement;
  protected readonly timeBar?: TimeBar;
  protected readonly timeLimitHandler?: NodeJS.Timeout;
  protected readonly timeUpdateHandler?: NodeJS.Timeout;

  constructor(options: SelectOptions<T>) {
    let bottomPosition = 0;
    this.screen = options.screen;
    this.items = options.items;
    this.onSelect = options.onSelect;

    // time-bar if any
    if (options.timeLimit && options.timeLimit > 0) {
      bottomPosition += 1;
      this.timeBar = new TimeBar({
        screen: this.screen,
        time: options.timeLimit,
        position: { bottom: 0 },
        onCompletion: () => {
          this.select(this.currentIndex);
        },
      });
    }

    // list of options
    this.listBox = blessed.list({
      mouse: true,
      keys: true,
      interactive: true,
      items: this.items.map(item => item.text),
      bottom: bottomPosition,
      padding: { left: 1 },
      height: this.items.length,
      width: '100%',
      style: {
        selected: {
          fg: 'green',
        },
      },
    });
    this.screen.append(this.listBox);
    bottomPosition += this.listBox.height as number;

    this.listBox.on('select item', (_item, index) => {
      this.currentIndex = index;
    });

    if (options.selected) {
      const selectedIndex = this.items.findIndex(
        item => options.selected === item.data
      );
      this.listBox.select(selectedIndex === -1 ? 0 : selectedIndex);
    }

    // text if any
    if (options.text) {
      this.textBox = blessed.text({
        tags: true,
        content: options.text,
        bottom: bottomPosition,
        valign: 'bottom',
      });
      this.screen.append(this.textBox);
    }

    this.listBox.focus();
    this.screen.render();

    this.listBox.on('select', (_list, index) => this.select(index));

    // don't allow to lose the focus until something is selected
    this.listBox.on('cancel', () => this.listBox.focus());
  }

  protected select(index: number): void {
    this.onSelect(this.items[index].data);
    this.screen.remove(this.listBox);

    if (this.textBox) {
      this.screen.remove(this.textBox);
    }
    if (this.timeBar) {
      this.timeBar.stop();
    }

    this.screen.render();
  }
}
