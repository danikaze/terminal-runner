import { join } from 'path';
import { Game } from 'engine/game';
import { TerminalUi } from 'ui/blessed';
import { getAppPath } from 'util/get-app-path';

const PARAM_DEBUG_MODE = '--debug';

async function run() {
  const debug = process.argv.includes(PARAM_DEBUG_MODE);
  const storiesFolder = join(getAppPath() || '', 'data', 'stories');
  const game = new Game({
    debug,
    Ui: TerminalUi,
    storiesFolders: [
      // storiesFolder,
      join(storiesFolder, 'test'),
    ],
  });

  await game.init();
  await game.start();
}

run();
