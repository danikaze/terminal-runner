import { getTestStoryData, TestRunCallback } from './util/test';

const run: TestRunCallback = async data => {
  await data.ui.text('This is TEXT 2.');
};

export const story = getTestStoryData(__filename, run);
