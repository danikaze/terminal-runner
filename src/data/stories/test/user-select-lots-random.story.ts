// tslint:disable: no-magic-numbers
import { SelectData } from 'engine/model/ui';
import { getTestStoryData, TestRunCallback } from './util/test';

const run: TestRunCallback = async data => {
  await data.ui.userSelect(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => ({
      text: `Option ${n} `.repeat(15),
      data: `Option ${n}`,
    })) as NonEmptyArray<SelectData<string>>,
    {
      randomSort: true,
    }
  );
};

export const story = getTestStoryData(__filename, run);
