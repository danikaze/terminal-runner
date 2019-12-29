// tslint:disable: no-magic-numbers
import { SelectData } from 'engine/model/ui';
import { getTestStoryData, TestRunCallback } from './util/test';

const run: TestRunCallback = async data => {
  await data.ui.userSelect(
    [1, 2, 3].map(n => ({
      text: `Option ${n}`,
      data: `Option ${n}`,
    })) as NonEmptyArray<SelectData<string>>
  );
};

export const story = getTestStoryData(__filename, run);
