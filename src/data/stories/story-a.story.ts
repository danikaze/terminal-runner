import { StoryData } from 'engine/story';

const RUN_MAX_TIMES = 3;

interface LocalData {
  run: number;
  lastSelection: number;
}

export const story: StoryData<LocalData, never> = {
  name: 'Story A',
  onLoad: ({ local }) => {
    local.run = 0;
  },
  selectCondition: ({ local }) => {
    return local.run < RUN_MAX_TIMES;
  },
  run: ({ local, ui }) =>
    new Promise<void>(async resolve => {
      local.run++;
      local.lastSelection = await ui.userSelect(
        [
          { text: 'Option 1', data: 1 },
          { text: 'Option 2', data: 2 },
          { text: 'Option 3', data: 3 },
        ],
        {
          text: 'User Select for {blue-fg}Story A{/blue-fg}:',
        }
      );

      resolve();
    }),
};
