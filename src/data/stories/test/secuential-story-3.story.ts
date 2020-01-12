import { getTestStoryData, TestRunCallback } from './util/test';

const run: TestRunCallback = async data => {
  await data.ui.text('This is TEXT 3.');
};

export const story = getTestStoryData(__filename, run);
