import * as blessed from 'blessed';
import { KeyDeclaration, compareKey } from 'ui/blessed/util/keys';

export interface TypewriterTextOptions {
  /** blessed screen where to render the widget */
  screen: blessed.Widgets.Screen;
  /** Complete text to display */
  text: string;
  /** Function to call when has been completely displayed */
  onDone: () => void;
}

export class TypewriterText {
  /** Text to show when finished */
  protected static readonly FINISHED_TEXT = '{green-fg}▼{/green-fg}';
  /** Time to wait between characters */
  protected static readonly DEFAULT_CHAR_DELAY = 25;
  /** Time to wait based on character */
  protected static readonly PAUSE_DELAYS: { [char: string]: number } = {
    ',': 300,
    '、': 300,
    '.': 500,
    '!': 500,
    '?': 500,
    '。': 500,
    '…': 500,
  };
  /** keys to skip the typewriter text and pass the text */
  protected static readonly keyDefDone: KeyDeclaration[] = [
    { key: 'space' },
    { key: 'enter' },
  ];

  // options
  protected readonly screen: blessed.Widgets.Screen;
  protected readonly text: string;
  protected readonly onDone: () => void;

  /** Main text element */
  protected readonly mainTextBox: blessed.Widgets.TextElement;

  /** Index of the last character shown to keep tracking of the typewriting effect */
  protected currentIndex = 0;
  /** List of opened tags that need to be closed to avoid glitchy text styles */
  protected openTags: string[] = [];
  /** Cached closing tags strings */
  protected closingTags = '';
  /** Handler of the update timeout to cancel it on user input */
  protected timeoutHandler!: NodeJS.Timeout;
  /** If the last character was one of `PAUSE_CHARACTERS` or not */
  protected nextDelay: number = TypewriterText.DEFAULT_CHAR_DELAY;

  constructor(options: TypewriterTextOptions) {
    this.screen = options.screen;
    this.text = options.text;
    this.onDone = options.onDone;

    this.mainTextBox = blessed.box({
      tags: true,
      top: 10,
      height: 'shrink',
    });

    this.mainTextBox.focus();
    this.mainTextBox.on('keypress', (char, key) => {
      if (!compareKey(TypewriterText.keyDefDone, char, key)) {
        return;
      }
      clearTimeout(this.timeoutHandler);
      if (this.currentIndex > this.text.length) {
        this.finish();
      } else {
        this.currentIndex = this.text.length - 1;
        this.update();
      }
    });
    this.screen.append(this.mainTextBox);
    this.screen.render();

    this.update = this.update.bind(this);
    this.update();
  }

  /**
   * Shows one more character and queue the next one,
   * or call `onDone` if finished
   */
  protected update(): void {
    this.currentIndex++;

    if (this.currentIndex > this.text.length) {
      // TODO: Fix positioning of the finished text because align is not working
      this.mainTextBox.setContent(
        this.mainTextBox.getContent() +
          `\n{right}${TypewriterText.FINISHED_TEXT}{/right}`
      );
      this.screen.render();
      return;
    }

    this.mainTextBox.setContent(this.getVisibleText());
    this.screen.render();

    this.timeoutHandler = setTimeout(this.update, this.nextDelay);
  }

  /**
   * Calculates the text to show
   */
  protected getVisibleText(): string {
    const nextChar = this.text[this.currentIndex - 1];
    if (nextChar === '{') {
      this.nextDelay = this.getNextDelay();
      const closeTagIndex = this.text.indexOf('}', this.currentIndex);
      const tag = this.text.substring(this.currentIndex, closeTagIndex);
      if (tag[0] === '/') {
        const openTagIndex = this.openTags.lastIndexOf(tag.substr(1));
        if (openTagIndex !== -1) {
          this.openTags.splice(openTagIndex);
        }
      } else {
        this.openTags.push(tag);
      }
      this.updateClosingTags();
      this.currentIndex = closeTagIndex + 1;
    } else {
      this.nextDelay = this.getNextDelay(nextChar);
    }

    return `${this.text.substring(0, this.currentIndex)}${this.closingTags}`;
  }

  /**
   * Called when finished, removing the widget off the screen, etc.
   */
  protected finish(): void {
    this.screen.remove(this.mainTextBox);
    this.screen.render();
    this.onDone();
  }

  /**
   * Update the closing tags only on tags open/close, to avoid doing it in each update
   */
  protected updateClosingTags(): void {
    this.closingTags = this.openTags.reduce(
      (str, tag) => `${str}{/${tag}}`,
      ''
    );
  }

  /**
   * Get how much time there's to wait based on the given char
   */
  protected getNextDelay(char?: string): number {
    // TODO: Manage cases like "!!" or "..."
    return (
      (char && TypewriterText.PAUSE_DELAYS[char]) ||
      TypewriterText.DEFAULT_CHAR_DELAY
    );
  }
}
