import * as blessed from 'blessed';

export interface TimeBarOptions {
  /** Blessed screen where to render the widget */
  screen: blessed.Widgets.Screen;
  /** Duration of the time bar */
  time: number;
  /** Where to render the widget */
  position: Partial<blessed.Widgets.Position>;
  /** Function to call when the time is over */
  onCompletion?: () => void;
  /** If `true` (by default), the widget will be removed when stopped or finished */
  removeOnCompletion?: boolean;
}

/**
 * Shows a progress bar that gets completed in the specified time
 */
export class TimeBar {
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
      ...options.position,
      orientation: 'horizontal',
      filled: 0,
      keys: false,
      mouse: false,
      height: 1,
      style: {
        bg: 'blue',
        bar: { bg: 'green', align: 'center' },
      },
    });
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
