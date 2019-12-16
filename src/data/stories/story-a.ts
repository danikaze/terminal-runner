import { StoryData } from 'engine/story';

const RUN_MAX_TIMES = 3;
let run = 0;

export const story: StoryData = {
  name: 'Story A',
  selectCondition: () => {
    return run < RUN_MAX_TIMES;
  },
  run: () =>
    new Promise<void>(resolve => {
      run++;
      resolve();
    }),
};
