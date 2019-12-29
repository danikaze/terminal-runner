import { StoryData } from 'engine/story';
import { SelectData } from 'engine/model/ui';
import { GlobalTestData } from './util/test';

export const STORY_NAME_INDEX = `test/index.ts`;

export const story: StoryData<never, GlobalTestData> = {
  name: STORY_NAME_INDEX,
  onLoad: ({ global }) => {
    global.story = STORY_NAME_INDEX;
  },
  selectCondition: ({ global }) => {
    return global.story === STORY_NAME_INDEX;
  },
  run: async ({ global, ui }) => {
    global.story = await ui.userSelect(
      global.storyList.map(story => ({
        text: story,
        data: story,
        enabled: global.story === STORY_NAME_INDEX,
      })) as NonEmptyArray<SelectData<string>>,
      {
        text: 'Tests:',
      }
    );
  },
};
