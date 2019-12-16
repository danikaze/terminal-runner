import { GameStatus } from './game';
import { logger } from './game-logger';

type SelectConditionCallback = (status: GameStatus) => boolean;
type RunCallback = () => Promise<void>;

interface InternalStoryData {
  source: string | undefined;
}

export interface StoryData {
  name: string;
  selectCondition: SelectConditionCallback;
  run: RunCallback;
}

/**
 * A Story is what dictates the game flow, actions, text, etc.
 */
export class Story {
  protected static idCounter = 0;

  public id: number;
  public source: string | undefined;
  public name: string;
  public selectCondition: SelectConditionCallback;
  protected runStory: RunCallback;

  constructor(internal: InternalStoryData, data: StoryData) {
    const errors = Story.validateStory(data);
    if (errors) {
      throw new Error(errors.join('\n'));
    }

    this.id = ++Story.idCounter;
    this.source = internal.source;
    this.name = data.name;
    this.selectCondition = data.selectCondition;
    this.runStory = data.run;
  }

  public static validateStory(data: StoryData): string[] | null {
    const errors: string[] = [];

    if (!data.name) {
      errors.push('Name not provided');
    }

    return errors.length === 0 ? null : errors;
  }

  public async run(): Promise<void> {
    logger.runningStory(this);
    return this.runStory();
  }
}
