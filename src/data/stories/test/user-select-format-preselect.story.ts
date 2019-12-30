// tslint:disable: no-magic-numbers
import { SelectData } from 'engine/model/ui';
import { getTestStoryData, TestRunCallback } from './util/test';

const run: TestRunCallback = async data => {
  await data.ui.userSelect(
    [1, 2, 3].map(n => ({
      text: `Option ${n}`,
      data: `Option ${n}`,
    })) as NonEmptyArray<SelectData<string>>,
    {
      text:
        'This text {bold}should{/bold} appear {red-fg}formatted{/red-fg}...\n' +
        'and with {blue-bg}colors{/blue-bg}.\n' +
        '{yellow-fg}Option 2{/yellow-fg} should be pre-selected:',
      selected: 'Option 2',
    }
  );
};

export const story = getTestStoryData(__filename, run);
