import {
  existsSync,
  readdirSync,
  statSync,
  writeFile,
  readFile,
  mkdirSync,
} from 'fs';
import { join, dirname } from 'path';
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
    getAppPath() || '',
    'data',
    'stories'
  );
  /** Default folder for the savegame files */
  protected static readonly SAVEGAME_FOLDER = join(
    getAppPath() || '',
    'data',
    'save'
  );

  /** RNG system to use across subsystems */
  public readonly rng: Rng;

  protected readonly uiConstructor: GameUiConstructor;
  protected readonly storiesFolder: string[];
  protected readonly savegamesFolder: string;
  protected readonly isDebugModeEnabled: boolean;

  /** UI to use */
  protected ui!: GameUi;
  /** List of loaded stories */
  protected stories: Story[] = [];
  /** variables to share across stories */
  protected global: Dict = {};
  /** variables local to each story */
  protected local: { [key: number]: {} } = {};

  constructor(options: GameOptions) {
    const errors = Game.validateOptions(options);
    if (errors) {
      throw new Error(errors.join('\n'));
    }

    this.storiesFolder =
      !options.storiesFolders || options.storiesFolders.length === 0
        ? [Game.STORY_FOLDER]
        : options.storiesFolders;
    this.savegamesFolder = options.savegamesFolder || Game.SAVEGAME_FOLDER;
    this.uiConstructor = options.Ui;
    this.isDebugModeEnabled = !!options.debug;
    this.rng = new Rng();
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
    this.ui = new this.options.Ui({
      debug: this.options.debug,
      rng: this.rng,
    });
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

    let story = this.selectStory();
    while (story) {
      await story.run(this.getStoryRunData(story.id));
      story = this.selectStory();
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
   * Load the stories from the specified folders recursively
   * Only files ending with `Game.STORY_EXT` will be loaded
   */
  protected async loadStories(folders: string[]): Promise<void> {
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
          const internal = { source: `${folder}/${file}` };
          const story = new Story(internal, storyData);
          this.local[story.id] = {};
          this.stories.push(story);
          story.loaded(this.getStoryRunData(story.id));
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
      story.selectCondition(this.getStoryRunData(story.id))
    );

    if (selectableStories.length === 0) return;

    return this.rng.pick(selectableStories);
  }

  /**
   * Get the data used when executing a story
   *
   * @param storyId id for the local data
   */
  protected getStoryRunData(storyId: number): StoryRunData {
    return {
      ui: this.ui,
      global: this.global,
      local: this.local[storyId],
      logger: logger.data,
    };
  }
}
