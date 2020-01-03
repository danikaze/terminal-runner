import * as blessed from 'blessed';
import { Widget, WidgetOptions, ResizeData } from '..';

export interface TimeBarOptions extends WidgetOptions {
  /** Duration of the time bar */
  time: number;
  /** Function to call when the time is over */
  onCompletion?: () => void;
  /** If `true` (by default), the widget will be removed when stopped or finished */
  removeOnCompletion?: boolean;
}

/**
 * Shows a progress bar that gets completed in the specified time
 */
export class TimeBar implements Widget {
  protected static readonly UPDATE_INTERVAL = 100;

  protected readonly screen: blessed.Widgets.Screen;
  protected readonly timeBar: blessed.Widgets.ProgressBarElement;
  protected readonly removeOnStop: boolean;
  protected readonly timeUpdateHandler: NodeJS.Timeout;
  protected readonly timeLimitHandler?: NodeJS.Timeout;
  protected progress: number = 0;
  protected updateInterval: number;
  protected remainingTime: number;

  constructor(options: TimeBarOptions) {
    this.screen = options.screen;
    this.removeOnStop = options.removeOnCompletion !== false;
    this.remainingTime = options.time;
    this.updateInterval = options.time / TimeBar.UPDATE_INTERVAL;

    this.timeBar = blessed.progressbar({
      orientation: 'horizontal',
      filled: 0,
      keys: false,
      mouse: false,
      style: {
        bg: 'blue',
        bar: { bg: 'green', align: 'center' },
      },
    });
    this.onResize(options, true);
    this.screen.append(this.timeBar);
    this.timeBar.setContent(this.getContent());
    this.screen.render();

    this.timeLimitHandler = setTimeout(() => {
      this.stop();
      if (options.onCompletion) {
        options.onCompletion!();
      }
    }, options.time);

    this.timeUpdateHandler = setInterval(() => {
      this.progress++;
      this.remainingTime -= this.updateInterval;
      this.timeBar.setProgress(this.progress);
      this.timeBar.setContent(this.getContent());
      this.screen.render();
    }, this.updateInterval);
  }

  /**
   * Method called when the widget needs to be resized
   */
  public onResize(
    { x, y, width, height }: ResizeData,
    delayedRender?: boolean
  ): void {
    const { timeBar } = this;

    timeBar.left = x;
    timeBar.top = y;
    timeBar.width = width;
    timeBar.height = height;

    if (!delayedRender) {
      this.screen.render();
    }
  }

  /**
   * Stops the time based-progress
   * If `options.removeOnStop` is true, it gets removed from the screen too
   */
  public stop(): void {
    clearInterval(this.timeUpdateHandler);
    if (this.timeLimitHandler) {
      clearTimeout(this.timeLimitHandler);
    }
    if (this.removeOnStop) {
      this.screen.remove(this.timeBar);
    }
  }

  /**
   * Because the scrollbar doesn't manages the `align` property well
   * center the text manually with this
   */
  protected getContent(): string {
    const text = `${Math.ceil(this.remainingTime / 1000)} s.`;
    const padding = ' '.repeat(
      (this.timeBar.width as number) / 2 - text.length / 2
    );
    return `${padding}${text}`;
  }
}
