import { join } from 'path';
import { Game } from 'engine/game';
import { TerminalUi } from 'ui/blessed';
import { getAppPath } from 'util/get-app-path';

const PARAM_PRINT_HELP = '--help';
const PARAM_DEBUG_MODE = '--debug';

async function run() {
  const help = process.argv.includes(PARAM_PRINT_HELP);
  if (help) {
    printHelp();
    return;
  }

  const debug = process.argv.includes(PARAM_DEBUG_MODE);
  const storiesFolder = join(getAppPath(), 'data', 'stories');
  const game = new Game({
    debug,
    Ui: TerminalUi,
    storiesFolders: [join(storiesFolder, 'test')],
  });

  await game.init();
  await game.start();
}

function printHelp() {
  // tslint:disable: no-console
  console.log(`${APP_NAME}-${APP_VERSION}-${GIT_VERSION}

  --help    Print this help messages and exit
  --debug   Enable debugging mode
`);
}

run();
