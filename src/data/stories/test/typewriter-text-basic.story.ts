import { getTestStoryData, TestRunCallback } from './util/test';

const run: TestRunCallback = async data => {
  await data.ui.text(
    [
      '{red-fg}Tag as first character{/red-fg} long line (1), long line (2) long line (3) {red-bg}{yellow-fg}double tag{/yellow-fg}{/red-bg} long line (4), long line (5) long line (6).',
      // 'Short line, but double pause!!',
      // 'nquis {blue-bg}single tag {yellow-fg}{bold}nested double tag{/bold}{/yellow-fg} single tag again{/blue-bg} laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla {red-fg}Tag as last character.{/red-fg}',
    ].join('\n')
  );
};

export const story = getTestStoryData(__filename, run);
