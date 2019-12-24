import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { GameUi, GameUiConstructor } from './model/ui';
import { Story, StoryData, StoryRunData } from './story';
import { logger } from './game-logger';
import { Rng } from 'util/rng';

interface GameOptions {
  Ui: GameUiConstructor;
  storiesFolders: string[];
}

export class Game {
  protected readonly options: GameOptions;
  /** RNG system to use across subsystems */
  protected readonly rng: Rng;
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

    this.options = options;
    this.rng = new Rng();
  }

  /**
   * Validate the passed options to detect runtime errors
   */
  public static validateOptions(options: GameOptions): string[] | null {
    const errors: string[] = [];

    options.storiesFolders.forEach(folder => {
      if (!existsSync(folder)) {
        errors.push(`Stories folder (${folder}) doesn't exist`);
      }
    });

    return errors.length === 0 ? null : errors;
  }

  /**
   * Initialize all the required resources
   */
  public async init(): Promise<void> {
    await this.loadStories(this.options.storiesFolders);
    this.ui = new this.options.Ui({ rng: this.rng });
  }

  /**
   * Start the game cycle
   */
  public async start(): Promise<void> {
    await this.ui.start();

    let story = this.selectStory();
    while (story) {
      await story.run(this.getStoryRunData(story.id));
      story = this.selectStory();
    }

    await this.ui.end();
  }

  /**
   * Load the stories from the specified folder
   */
  protected async loadStories(folders: string[]): Promise<void> {
    folders.forEach(folder => {
      readdirSync(folder).forEach(file => {
        if (!file.endsWith('.js')) {
          return;
        }

        try {
          const storyData = __non_webpack_require__(join(folder, file))
            .story as StoryData;
          const internal = { source: `${folder}/${file}` };
          const story = new Story(internal, storyData);
          this.local[story.id] = {};
          this.stories.push(story);
          story.loaded(this.getStoryRunData(story.id));
          logger.storyLoaded(story);
        } catch (errors) {
          logger.errorLoadingStory(errors);
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
    };
  }
}
