import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { GameUi } from './model/ui';
import { Story, StoryData } from './story';
import { logger } from './game-logger';

interface GameOptions {
  ui: GameUi;
  storiesFolders: string[];
}

export class Game {
  protected readonly options: GameOptions;
  protected stories: Story[] = [];

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

  public async init(): Promise<void> {
    await this.loadStories(this.options.storiesFolders);
  }

  protected async loadStories(folders: string[]): Promise<void> {
    folders.forEach(folder => {
      readdirSync(folder).forEach(file => {
        if (!file.endsWith('.js')) {
          return;
        }

        try {
          const storyData = __non_webpack_require__(join(folder, file))
            .story as StoryData;
          const story = new Story(storyData, `${folder}/${file}`);
          this.stories.push(story);
          logger.storyLoaded(story);
        } catch (errors) {
          logger.errorLoadingStory(errors);
        }
      });
    });
  }
}
