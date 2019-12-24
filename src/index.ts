import { join } from 'path';
import { Game } from 'engine/game';
import { TerminalUi } from 'ui/blessed';
import { getAppPath } from 'util/get-app-path';
import { GameLogger } from 'engine/game-logger';

async function run() {
  GameLogger.init();

  const game = new Game({
    Ui: TerminalUi,
    storiesFolders: [join(getAppPath() || '', 'data', 'stories')],
  });

  await game.init();
  await game.start();
}

run();
