import { logger } from './game-logger';
import { GameUi } from './model/ui';

type OnLoadCallback<L, G> = (data: StoryRunData<L, G>) => void;
type SelectConditionCallback<L, G> = (data: StoryRunData<L, G>) => boolean;
type RunCallback<L, G> = (data: StoryRunData<L, G>) => Promise<void>;

interface InternalStoryData {
  source: string | undefined;
}

export interface StoryRunData<L extends {} = {}, G extends {} = {}> {
  ui: GameUi;
  global: G;
  local: L;
}

export interface StoryData<L extends {} = {}, G extends {} = {}> {
  name: string;
  onLoad: OnLoadCallback<L, G>;
  selectCondition: SelectConditionCallback<L, G>;
  run: RunCallback<L, G>;
}

/**
 * A Story is what dictates the game flow, actions, text, etc.
 *
 * Variables should be used within the `data` received in the callbacks instead of using
 * instance attributes, since the data will be stored and the attributes will not.
 */
export class Story<L extends {} = {}, G extends {} = {}> {
  protected static idCounter = 0;

  public id: number;
  public source: string | undefined;
  public name: string;
  public selectCondition: SelectConditionCallback<L, G>;
  protected onLoad: OnLoadCallback<L, G>;
  protected runStory: RunCallback<L, G>;

  constructor(internal: InternalStoryData, data: StoryData<L, G>) {
    this.id = ++Story.idCounter;
    this.source = internal.source;
    this.name = data.name;
    this.selectCondition = data.selectCondition;
    this.runStory = data.run;
    this.onLoad = data.onLoad;
  }

  public loaded(data: StoryRunData<L, G>): void {
    this.onLoad(data);
  }

  public async run(data: StoryRunData<L, G>): Promise<void> {
    logger.runningStory((this as unknown) as Story);
    return this.runStory(data);
  }
}
