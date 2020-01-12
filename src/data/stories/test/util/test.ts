import { StoryData, StoryRunData } from 'engine/story';
import { basename } from 'path';
import { STORY_ID_INDEX } from '../index.story';

export interface GlobalTestData {
  story: string;
  storyList: string[];
}

export type TestRunCallback = (
  data: StoryRunData<never, GlobalTestData>
) => Promise<void>;

const STORY_EXT = /\.story\.[tj]s$/;

export function getTestStoryData(
  fileName: string,
  run: (data: StoryRunData<never, GlobalTestData>) => Promise<void>
): StoryData<never, GlobalTestData> {
  const id = `test/${basename(fileName).replace(STORY_EXT, '')}`;

  return {
    id,

    onLoad: ({ global, logger }) => {
      logger.info(`Load: ${id}`);
      if (global.storyList) {
        global.storyList.push(id);
        global.storyList.sort();
      } else {
        global.storyList = [id];
      }
    },

    selectCondition: ({ global }) => {
      return global.story === id;
    },

    run: async data => {
      await run(data);
      data.global.story = STORY_ID_INDEX;
    },
  };
}
