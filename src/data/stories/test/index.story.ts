import { StoryData } from 'engine/story';
import { SelectData } from 'engine/model/ui';
import { GlobalTestData } from './util/test';

export const STORY_ID_INDEX = `test/index.ts`;

export const story: StoryData<never, GlobalTestData> = {
  id: STORY_ID_INDEX,
  onLoad: ({ global }) => {
    global.story = STORY_ID_INDEX;
  },
  selectCondition: ({ global }) => {
    return global.story === STORY_ID_INDEX;
  },
  run: async ({ global, ui }) => {
    global.story = await ui.userSelect(
      global.storyList.map(story => ({
        text: story,
        data: story,
        enabled: global.story === STORY_ID_INDEX,
      })) as NonEmptyArray<SelectData<string>>,
      {
        text: 'Tests:',
      }
    );
  },
};
