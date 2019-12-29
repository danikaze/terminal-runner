import { StoryData, StoryRunData } from 'engine/story';
import { basename } from 'path';
import { STORY_NAME_INDEX } from '..';

export interface GlobalTestData {
  story: string;
  storyList: string[];
}

export type TestRunCallback = (
  data: StoryRunData<never, GlobalTestData>
) => Promise<void>;

export function getTestStoryData(
  fileName: string,
  run: (data: StoryRunData<never, GlobalTestData>) => Promise<void>
): StoryData<never, GlobalTestData> {
  const storyName = `test/${basename(fileName)}`;

  return {
    name: storyName,

    onLoad: ({ global, logger }) => {
      logger.info(`Load: ${storyName}`);
      if (global.storyList) {
        global.storyList.push(storyName);
        global.storyList.sort();
      } else {
        global.storyList = [storyName];
      }
    },

    selectCondition: ({ global }) => {
      return global.story === storyName;
    },

    run: async data => {
      await run(data);
      data.global.story = STORY_NAME_INDEX;
    },
  };
}
