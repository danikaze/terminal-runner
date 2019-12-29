import { join } from 'path';
import { Game } from 'engine/game';
import { TerminalUi } from 'ui/blessed';
import { getAppPath } from 'util/get-app-path';

async function run() {
  const storiesFolder = join(getAppPath() || '', 'data', 'stories');
  const game = new Game({
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
