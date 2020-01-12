import { getTestStoryData, TestRunCallback } from './util/test';

const run: TestRunCallback = async data => {
  await data.ui.text('Right after this TEXT 1, text 2 and 3 should appear');
  data.game.setNextStory('test/secuential-story-2');
  data.game.queueNextStory('test/secuential-story-3');
};

export const story = getTestStoryData(__filename, run);
