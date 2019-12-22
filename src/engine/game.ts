import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { GameUi } from './model/ui';
import { Story, StoryData, StoryRunData } from './story';
import { logger } from './game-logger';

interface GameOptions {
  ui: GameUi;
  storiesFolders: string[];
}

export interface GameStatus {}

export class Game {
  protected readonly options: GameOptions;
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
  }

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
  }

  /**
   * Start the game cycle
   */
  public async start(): Promise<void> {
    let story = this.selectStory();
    while (story) {
      await story.run(this.getStoryRunData(story.id));
      story = this.selectStory();
    }
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

    // TODO: Provide a proper RNG
    const index = Math.floor(
      (Math.random() * 1000000) % selectableStories.length
    );
    return selectableStories[index];
  }

  /**
   * Get the data used when executing a story
   *
   * @param storyId id for the local data
   */
  protected getStoryRunData(storyId: number): StoryRunData {
    return {
      ui: this.options.ui,
      global: this.global,
      local: this.local[storyId],
    };
  }
}
