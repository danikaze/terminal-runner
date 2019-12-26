import * as Transport from 'winston-transport';
import { Rng } from 'util/rng';

export interface InitData {
  /** Random engine used by the game */
  rng: Rng;
  /** Debug mode enabled or not */
  debug?: boolean;
}

export interface GameUiConstructor {
  /**
   * Called during the game initialization
   */
  new (data: InitData): GameUi;
}

export interface SelectData<T> {
  /** Text to display as an option */
  text: string;
  /** Data to return if selected */
  data: T;
  /** If `false` will be displayed as disabled */
  enabled?: boolean;
}

export interface SelectOptions<T> {
  /** Text to show with the options */
  text?: string;
  /** If `true`, options will be shuffled */
  randomSort?: boolean;
  /** Pre-selected option. By default will be the first one */
  selected?: T;
  /** If specified (ms.), option will be autoselected after this time */
  timeLimit?: number;
}

export interface GameUi {
  /**
   * If defined, the game will use it to make the UI aware of the game logs
   */
  gameLog?: {
    getTransport(): Transport;
    show(): Promise<void>;
    hide(): Promise<void>;
    toggle(): Promise<void>;
  };
  /**
   * Called when the game starts
   */
  start(): Promise<void>;
  /**
   * Called when the game ends and closes
   */
  end(): Promise<void>;
  /**
   * Present the provided options for the user to select between them
   */
  userSelect<T>(
    data: NonEmptyArray<SelectData<T>>,
    options?: SelectOptions<T>
  ): Promise<T>;
}
