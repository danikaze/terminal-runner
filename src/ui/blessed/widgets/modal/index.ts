import * as blessed from 'blessed';
import { Widget, WidgetOptions, ResizeData } from '..';

export interface ModalOptions extends WidgetOptions {
  children: blessed.Widgets.BlessedElement[];
  onFocus?: () => void;
}

/**
 * Reusable way to create consistent Modal widgets
 */
export class Modal implements Widget {
  protected static readonly BORDER?: blessed.Widgets.Border | 'line' | 'bg' =
    'line';
  protected static readonly PADDING: Required<blessed.Widgets.Padding> = {
    top: 1,
    bottom: 1,
    left: 2,
    right: 2,
  };

  // options
  protected readonly screen: blessed.Widgets.Screen;

  // blessed widgets
  protected readonly background: blessed.Widgets.BoxElement;
  protected readonly container: blessed.Widgets.BoxElement;

  // widget state
  protected isVisible = false;

  constructor(options: ModalOptions) {
    this.screen = options.screen;

    this.background = blessed.box({
      mouse: true,
      clickable: true,
      autofocus: true,
      transparent: true,
    });

    this.container = blessed.box({
      border: Modal.BORDER,
      padding: Modal.PADDING,
      clickable: true,
      autofocus: true,
    });

    if (options.onFocus) {
      this.background.on('focus', options.onFocus);
      this.container.on('focus', options.onFocus);
    }

    this.background.append(this.container);
    options.children.forEach(child => {
      this.container.append(child);
    });

    this.onResize(options);
  }

  /**
   * Method called when the widget needs to be resized
   */
  public onResize(data: ResizeData, delayedRender?: boolean | undefined): void {
    let contentWidth = 0;
    let contentHeight = 0;

    (this.container.children as blessed.Widgets.BlessedElement[]).forEach(
      node => {
        let left = 0;
        let top = 0;
        try {
          left = node.left as number;
        } catch (e) {}
        try {
          top = node.top as number;
        } catch (e) {}
        contentWidth = Math.max(left + (node.width as number), contentWidth);
        contentHeight = Math.max(top + (node.height as number), contentHeight);
      }
    );

    this.background.top = 0;
    this.background.left = 0;
    this.background.width = data.width;
    this.background.height = data.height;

    this.container.width =
      contentWidth +
      Modal.PADDING.left +
      Modal.PADDING.right +
      (Modal.BORDER ? 2 : 0);
    this.container.height =
      contentHeight +
      Modal.PADDING.top +
      Modal.PADDING.bottom +
      (Modal.BORDER ? 2 : 0);
    this.container.top =
      Math.floor((data.height - this.container.height) / 2) -
      (Modal.BORDER ? 1 : 0);
    this.container.left =
      Math.floor((data.width - this.container.width) / 2) -
      (Modal.BORDER ? 1 : 0);

    if (!delayedRender) {
      this.screen.render();
    }
  }

  /**
   * Shows the widget
   */
  public async show(): Promise<void> {
    if (this.isVisible) return;

    this.isVisible = true;
    this.screen.append(this.background);
    this.screen.render();
  }

  /**
   * Hides the widget
   */
  public async hide(): Promise<void> {
    if (!this.isVisible) return;

    this.isVisible = false;
    this.screen.remove(this.background);
    this.screen.render();
  }

  /**
   * Toggles the widget between shown/hidden
   */
  public async toggle(): Promise<void> {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}
