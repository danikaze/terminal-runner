import { logger } from './game-logger';
import { GameUi } from './model/ui';
import { NsLogger } from 'util/logger';
import { StoryGame } from './model/story-game';

type OnLoadCallback<L, G> = (data: StoryRunData<L, G>) => void;
type SelectConditionCallback<L, G> = (data: StoryRunData<L, G>) => boolean;
type RunCallback<L, G> = (data: StoryRunData<L, G>) => Promise<void>;

interface InternalStoryData {
  source: string;
}

export interface StoryRunData<L extends {} = {}, G extends {} = {}> {
  ui: GameUi;
  game: StoryGame;
  global: G;
  local: L;
  logger: NsLogger;
}

export interface StoryData<L extends {} = {}, G extends {} = {}> {
  /** ID of the story. Must be unique */
  id: string;
  /** Function to call right after the story is loaded, for initialization */
  onLoad?: OnLoadCallback<L, G>;
  /** Should return `true` if the story is selectable */
  selectCondition: SelectConditionCallback<L, G>;
  /** Function to call when the story is selected, to get control of the game workflow */
  run: RunCallback<L, G>;
}

/**
 * A Story is what dictates the game flow, actions, text, etc.
 *
 * Variables should be used within the `data` received in the callbacks instead of using
 * instance attributes, since the data will be stored and the attributes will not.
 */
export class Story<L extends {} = {}, G extends {} = {}> {
  public source: string;
  public id: string;
  public selectCondition: SelectConditionCallback<L, G>;
  protected onLoad?: OnLoadCallback<L, G>;
  protected runStory: RunCallback<L, G>;

  constructor(internal: InternalStoryData, data: StoryData<L, G>) {
    this.source = internal.source;
    this.id = data.id;
    this.selectCondition = data.selectCondition;
    this.runStory = data.run;
    this.onLoad = data.onLoad;
  }

  /**
   * Function to call right after the story is loaded, for initialization
   */
  public loaded(data: StoryRunData<L, G>): void {
    this.onLoad && this.onLoad(data);
  }

  /**
   * Function called if the story is selected.
   * Gives the workflow of the game to the Story until it's finished
   */
  public async run(data: StoryRunData<L, G>): Promise<void> {
    logger.story.running((this as unknown) as Story);
    return this.runStory(data);
  }
}
