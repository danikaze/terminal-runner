import {
  existsSync,
  readdirSync,
  statSync,
  writeFile,
  readFile,
  mkdirSync,
} from 'fs';
import { join, dirname, relative } from 'path';
import { GameUi, GameUiConstructor } from './model/ui';
import { Story, StoryData, StoryRunData } from './story';
import { logger, GameLogger } from './game-logger';
import { Rng } from 'util/rng';
import { getAppPath } from 'util/get-app-path';

interface GameOptions {
  Ui: GameUiConstructor;
  storiesFolders?: string[];
  savegamesFolder?: string;
  debug?: boolean;
}

export class Game {
  /** Extension for the story files */
  protected static readonly STORY_EXT = 'story.js';
  /** Default folder for the stories */
  protected static readonly STORY_FOLDER = join(
    getAppPath(),
    'data',
    'stories'
  );
  /** Default folder for the savegame files */
  protected static readonly SAVEGAME_FOLDER = join(
    getAppPath(),
    'data',
    'save'
  );

  /** RNG system to use across subsystems */
  public readonly rng: Rng;

  /** Constructor to create the UI */
  protected readonly uiConstructor: GameUiConstructor;
  /** Folder where the stories are stored */
  protected readonly storiesFolder: string[];
  /** Folder where the savegame files are stored */
  protected readonly savegamesFolder: string;
  /** If it's in debug mode or not */
  protected readonly isDebugModeEnabled: boolean;

  /** UI to use */
  protected readonly ui: GameUi;
  /** List of loaded stories */
  protected stories: Story[] = [];
  /** Current story being run */
  protected currentStory: Story | undefined;
  /** variables to share across stories */
  protected global: Dict = {};
  /** variables local to each story */
  protected local: { [storyId: string]: {} } = {};

  constructor(options: GameOptions) {
    const errors = Game.validateOptions(options);
    if (errors) {
      throw new Error(errors.join('\n'));
    }

    // attributes
    this.storiesFolder =
      !options.storiesFolders || options.storiesFolders.length === 0
        ? [Game.STORY_FOLDER]
        : options.storiesFolders;
    this.savegamesFolder = options.savegamesFolder || Game.SAVEGAME_FOLDER;
    this.uiConstructor = options.Ui;
    this.isDebugModeEnabled = !!options.debug;

    // instances
    this.rng = new Rng();
    this.ui = new this.uiConstructor({
      game: this,
      debug: this.isDebugModeEnabled,
    });
  }

  /**
   * Validate the passed options to detect runtime errors
   */
  public static validateOptions(options: GameOptions): string[] | null {
    const errors: string[] = [];
    const { storiesFolders, savegamesFolder } = options;

    if (storiesFolders) {
      storiesFolders.forEach(folder => {
        if (!existsSync(folder)) {
          errors.push(`Stories folder (${folder}) doesn't exist`);
        }
      });
    }

    if (savegamesFolder && !existsSync(savegamesFolder)) {
      errors.push(`Savegames folder (${savegamesFolder}) doesn't exist`);
    }

    return errors.length === 0 ? null : errors;
  }

  /**
   * Initialize all the required resources
   */
  public async init(): Promise<void> {
    const loggerTransports = this.ui.gameLog
      ? [this.ui.gameLog.getTransport()]
      : undefined;

    GameLogger.init(loggerTransports);

    await this.loadStories(this.storiesFolder);
  }

  /**
   * Start the game cycle
   */
  public async start(): Promise<void> {
    logger.game.start();
    await this.ui.start();

    this.currentStory = this.selectStory();
    while (this.currentStory) {
      await this.currentStory.run(this.getStoryRunData(this.currentStory));
      this.currentStory = this.selectStory();
    }

    logger.game.end();
    await this.ui.end();
  }

  /**
   * Exit the game
   */
  public quit(): void {
    process.exit(0);
  }

  /**
   * Save the current status to the game
   *
   * @param file Filename (without folders, etc.). It will be stored in the save folder
   */
  public saveGame(file: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const filePath = join(this.savegamesFolder, file);

      const json = JSON.stringify(
        {
          currentStory: this.currentStory && this.currentStory.source,
          local: this.local,
          global: this.global,
        },
        null,
        this.isDebugModeEnabled ? 2 : 0
      );

      if (!existsSync(dirname(filePath))) {
        mkdirSync(dirname(filePath));
      }

      writeFile(filePath, json, error => {
        if (error) {
          logger.game.errorSavingGame(file, error.message);
          reject(error);
        } else {
          logger.game.gameSaved(file);
          resolve();
        }
      });
    });
  }

  /**
   * Load the status of the game from a file
   *
   * @param file Filename (without folders, etc.). It will be read from the save folder
   */
  public async loadGame(file: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const filePath = join(this.savegamesFolder, file);

      readFile(filePath, (error, data) => {
        if (error) {
          logger.game.errorLoadingGame(file, error.message);
          reject(error);
          return;
        }

        try {
          const json = JSON.parse(data.toString());
          this.global = json.global;
          this.local = json.local;
          // TODO: Reset status of the game properly
          if (json.currentStory) {
            this.currentStory = this.stories[json.currentStory];
          }
        } catch (error) {
          logger.game.errorLoadingGame(file, error.message);
          reject(error);
          return;
        }

        logger.game.gameLoaded(file);
        resolve();
      });
    });
  }

  /**
   * Read a value from the system data
   *
   * Accepted keys are:
   * - currentStory
   * - global.*
   * - local.*
   */
  public getValue(key: string): string | undefined {
    if (/^currentStory$/i.test(key)) {
      return (this.currentStory && this.currentStory.name) || '';
    }

    let value: unknown;
    if (/^global.(.+)$/i.test(key)) {
      value = this.global[RegExp.$1];
    } else if (/^local.(.+)$/i.test(key)) {
      const local = this.currentStory && this.local[this.currentStory.source];
      value = local && (local as { [key: string]: unknown })[RegExp.$1];
    } else {
      throw new SyntaxError(`Unknown key: ${key}`);
    }

    return value === undefined ? undefined : JSON.stringify(value, null, 2);
  }

  /**
   * Load the stories from the specified folders recursively
   * Only files ending with `Game.STORY_EXT` will be loaded
   */
  protected async loadStories(folders: string[]): Promise<void> {
    const appPath = getAppPath();

    folders.forEach(folder => {
      readdirSync(folder).forEach(async file => {
        const filePath = join(folder, file);

        if (statSync(filePath).isDirectory()) {
          await this.loadStories([filePath]);
          return;
        }

        if (!file.endsWith(Game.STORY_EXT)) {
          return;
        }

        try {
          const storyData = __non_webpack_require__(filePath)
            .story as StoryData;
          const internal = { source: relative(appPath, join(folder, file)) };
          const story = new Story(internal, storyData);
          this.local[story.source] = {};
          this.stories.push(story);
          story.loaded(this.getStoryRunData(story));
          logger.story.loaded(story);
        } catch (errors) {
          logger.story.errorLoading(errors);
        }
      });
    });
  }

  /**
   * Get one random story from all the selectable ones
   */
  protected selectStory(): Story | undefined {
    const selectableStories = this.stories.filter(story =>
      story.selectCondition(this.getStoryRunData(story))
    );

    if (selectableStories.length === 0) return;

    return this.rng.pick(selectableStories);
  }

  /**
   * Get the data used when executing a story
   *
   * @param storyId id for the local data
   */
  protected getStoryRunData(story: Story): StoryRunData {
    return {
      ui: this.ui,
      global: this.global,
      local: this.local[story.source],
      logger: logger.data,
    };
  }
}
