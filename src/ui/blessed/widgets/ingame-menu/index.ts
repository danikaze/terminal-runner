import * as blessed from 'blessed';
import { Game } from 'engine/game';
import { alignCenter } from 'ui/blessed/util/format';
import { KeyDeclaration, compareKey } from 'ui/blessed/util/keys';
import { Widget, WidgetOptions, ResizeData } from '..';
import { clamp } from 'util/clamp';

export interface IngameMenuOptions extends WidgetOptions {
  /** Game system used for the system calls */
  game: Game;
  /** If set to `false` it won't select the first option after the last one */
  loop?: boolean;
  /** If set to `false` it will remember the last option when opening the menu again */
  resetSelection?: boolean;
}

export class IngameMenu implements Widget {
  /** List of options to present */
  protected static readonly MENU_OPTIONS = [
    'Continue',
    'Options',
    'Save Game',
    'Load Game',
    'Quit',
  ];
  /** Keys that will be allowed to bubble up as event */
  protected static readonly EXTERNAL_KEYS = ['q', 'escape'];
  /** Key combination used to navigate to the previous option */
  protected static readonly keyDefPrevOption: KeyDeclaration = { key: 'up' };
  /** Key combination used to navigate to the next option */
  protected static readonly keyDefNextOption: KeyDeclaration = { key: 'down' };

  // options
  protected readonly screen: blessed.Widgets.Screen;
  protected readonly game: Game;
  protected readonly loop: boolean;
  protected readonly resetSelection: boolean;

  // blessed widgets
  protected readonly buttonsBox: blessed.Widgets.BoxElement;
  protected readonly buttons: blessed.Widgets.ButtonElement[] = [];

  // current status of the widget
  protected isVisible: boolean = false;
  protected currentIndex: number = 0;

  constructor(options: IngameMenuOptions) {
    this.moveSelectionKeyHandler = this.moveSelectionKeyHandler.bind(this);
    this.buttonPressedHandler = this.buttonPressedHandler.bind(this);

    this.screen = options.screen;
    this.game = options.game;
    this.loop = options.loop !== false;
    this.resetSelection = options.resetSelection !== false;

    this.buttonsBox = blessed.box({
      border: {
        type: 'line',
      },
      padding: {
        left: 2,
        right: 2,
      },
      shadow: true,
    });

    let y = 1;
    const optionWidth = this.getMenuContentMinWidth();
    IngameMenu.MENU_OPTIONS.forEach(text => {
      // TODO: Remove once this features are implemented
      // Also, please come with a proper theme of colors for all terminals, because in windows it's horrible
      const disabled = ['Options', 'Save Game', 'Load Game'].includes(text);
      this.buttons.push(
        blessed.button({
          keyable: true,
          content: alignCenter(text, optionWidth),
          top: y,
          align: 'center',
          width: optionWidth,
          height: 'shrink',
          style: {
            fg: disabled ? 'gray' : 'white',
            focus: {
              fg: disabled ? 'red' : 'yellow',
            },
          },
        })
      );
      y += 2;
    });

    this.buttons.forEach(button => {
      this.buttonsBox.append(button);
      button.on('press', this.buttonPressedHandler);
    });

    this.onResize(options, true);
  }

  /**
   * Method called when the widget needs to be resized
   */
  public onResize(data: ResizeData, delayedRender?: boolean | undefined): void {
    // tslint:disable: no-magic-numbers
    this.buttonsBox.width = this.getMenuContentMinWidth() + 6; // some margin (+ 2 borders)
    this.buttonsBox.height = IngameMenu.MENU_OPTIONS.length * 2 + 3; // 1 margin between each option (+ 2 borders)
    this.buttonsBox.top =
      Math.floor((data.height - this.buttonsBox.height) / 2) - 1;
    this.buttonsBox.left =
      Math.floor((data.width - this.buttonsBox.width) / 2) - 1;

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
    if (this.resetSelection) {
      this.currentIndex = 0;
    }
    this.screen.saveFocus();
    this.buttons[this.currentIndex].focus();
    this.screen.append(this.buttonsBox);

    this.screen.grabKeys = true;
    // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/41397
    ((this.screen.ignoreLocked as unknown) as string[]).push(
      ...IngameMenu.EXTERNAL_KEYS
    );
    this.buttonsBox.on('element keypress', this.moveSelectionKeyHandler);

    this.screen.render();
  }

  /**
   * Hides the widget
   */
  public async hide(): Promise<void> {
    if (!this.isVisible) return;

    this.isVisible = false;
    this.screen.restoreFocus();
    this.screen.remove(this.buttonsBox);

    this.screen.grabKeys = false;
    // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/41397
    const ignoreLocked = (this.screen.ignoreLocked as unknown) as string[];
    IngameMenu.EXTERNAL_KEYS.forEach(key => {
      ignoreLocked.splice(ignoreLocked.indexOf(key));
    });
    this.buttonsBox.off('element keypress', this.moveSelectionKeyHandler);

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

  protected getMenuContentMinWidth(): number {
    return IngameMenu.MENU_OPTIONS.reduce(
      (max, txt) => Math.max(max, txt.length),
      0
    );
  }

  /**
   * Process keyevents for option selection change
   */
  protected moveSelectionKeyHandler(
    _elem: blessed.Widgets.ButtonElement,
    char: string,
    key: blessed.Widgets.Events.IKeyEventArg
  ): boolean {
    if (compareKey(IngameMenu.keyDefPrevOption, char, key)) {
      this.moveSelectedOption(-1);
      return false;
    }

    if (compareKey(IngameMenu.keyDefNextOption, char, key)) {
      this.moveSelectedOption(1);
      return false;
    }

    return true;
  }

  /**
   * Call the proper action when the option button is pressed
   */
  protected buttonPressedHandler(): void {
    const option = IngameMenu.MENU_OPTIONS[this.currentIndex].toLowerCase();

    if (option === 'continue') {
      this.hide();
      return;
    }

    // if (option === 'options') {
    //   return;
    // }

    // if (option === 'save game') {
    //   return;
    // }

    // if (option === 'load game') {
    //   return;
    // }

    if (option === 'quit') {
      this.game.quit();
      return;
    }
  }

  /**
   * Change the focused button
   */
  protected moveSelectedOption(delta: number): void {
    if (!this.loop) {
      this.currentIndex = clamp(
        0,
        this.currentIndex + delta,
        IngameMenu.MENU_OPTIONS.length - 1
      );
    } else {
      this.currentIndex =
        (IngameMenu.MENU_OPTIONS.length + this.currentIndex + delta) %
        IngameMenu.MENU_OPTIONS.length;
    }
    this.buttons[this.currentIndex].focus();
    this.screen.render();
  }
}
