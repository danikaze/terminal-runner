import * as blessed from 'blessed';
import { Widget, WidgetOptions, ResizeData } from '..';
import { TimeBar } from '../time-bar';

export interface SelectData<T> {
  /** Text to display as an option */
  text: string;
  /** Data to return if selected */
  data: T;
  /** If `false` will be displayed as disabled */
  enabled?: boolean;
}

export interface SelectOptions<T> extends WidgetOptions {
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
export class Select<T> implements Widget {
  protected readonly screen: blessed.Widgets.Screen;
  protected readonly items: SelectData<T>[];
  protected readonly onSelect: (data: T) => void;
  protected currentIndex: number = 0;

  // blessed widgets
  protected readonly container: blessed.Widgets.BoxElement;
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

    this.container = blessed.box();
    this.screen.append(this.container);

    // time-bar if any
    if (options.timeLimit && options.timeLimit > 0) {
      bottomPosition += 1;
      this.timeBar = new TimeBar({
        screen: this.screen,
        time: options.timeLimit,
        x: options.x,
        y: options.y + options.height - 1,
        width: options.width,
        height: options.height,
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
      style: {
        selected: {
          fg: 'green',
        },
      },
    });
    this.container.append(this.listBox);
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
        valign: 'bottom',
      });
      this.container.append(this.textBox);
    }

    this.onResize(options, true);
    this.listBox.focus();
    this.screen.render();

    this.listBox.on('select', (_list, index) => this.select(index));

    // don't allow to lose the focus until something is selected
    this.listBox.on('cancel', () => this.listBox.focus());
  }

  /**
   * Method called when the widget needs to be resized
   */
  public onResize(
    { x, y, width, height }: ResizeData,
    delayedRender?: boolean
  ): void {
    const { container, timeBar, listBox, textBox } = this;
    let bottomPosition = 0;

    container.left = x;
    container.top = y;
    container.width = width;
    container.height = height;

    if (timeBar) {
      timeBar.onResize({
        x,
        width,
        y: y + height - 1,
        height: 1,
      });
      bottomPosition += 1;
    }

    listBox.bottom = bottomPosition;
    listBox.width = width;
    listBox.height = this.items.length;
    bottomPosition += listBox.height;

    if (textBox) {
      textBox.bottom = bottomPosition;
    }

    if (!delayedRender) {
      this.screen.render();
    }
  }

  protected select(index: number): void {
    if (this.timeBar) {
      this.timeBar.stop();
    }
    if (this.textBox) {
      this.container.remove(this.textBox);
    }

    this.screen.remove(this.container);
    this.screen.render();

    this.onSelect(this.items[index].data);
  }
}
