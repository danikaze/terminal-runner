import { StoryData } from 'engine/story';

const RUN_MAX_TIMES = 3;

interface LocalData {
  run: number;
}

export const story: StoryData<LocalData, never> = {
  name: 'Story A',
  onLoad: ({ local }) => {
    local.run = 0;
  },
  selectCondition: ({ local }) => {
    return local.run < RUN_MAX_TIMES;
  },
  run: ({ local }) =>
    new Promise<void>(resolve => {
      local.run++;
      resolve();
    }),
};
