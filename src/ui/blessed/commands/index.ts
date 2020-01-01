import { tokenizer } from 'util/tokenizer';
import { Game } from 'engine/game';
import { Log } from '../widgets/log';

interface CommandData {
  log: Log;
  game: Game;
}

export type CommandCall = (
  data: CommandData,
  ...args: string[]
) => void | Promise<void>;

interface AutocompletionResult {
  text: string;
  exact?: boolean;
}

const commandMap: {
  [command: string]: CommandCall;
} = {
  help: ({ log }) => {
    log.addMessage('Console keys:');
    log.addMessage(' [ {yellow-fg}`{/yellow-fg} ] Toggle the log/terminal');
    log.addMessage(' [ {yellow-fg}TAB{/yellow-fg} ] Auto-complete');
    log.addMessage(' [ {yellow-fg}C-⬆︎{/yellow-fg} ] Previous command');
    log.addMessage(' [ {yellow-fg}C-⬇︎{/yellow-fg} ] Next command');
    log.addMessage(' [ {yellow-fg}S-⬆︎{/yellow-fg} ] Shrink terminal');
    log.addMessage(' [ {yellow-fg}S-⬇︎{/yellow-fg} ] Expand terminal');
    log.addMessage(
      ' [ {yellow-fg}⬆︎{/yellow-fg}|{yellow-fg}PageUp{/yellow-fg} ] Scroll log messages up'
    );
    log.addMessage(
      ' [ {yellow-fg}⬇︎{/yellow-fg}|{yellow-fg}PageDown{/yellow-fg} ] Scroll log messages down'
    );
  },
  echo: ({ log }, ...args) => {
    log.addMessage(`{grey-fg}${args.join(' ')}{/grey-fg}`);
  },
  exit: ({ game }) => game.quit(),
  clear: ({ log }) => log.clear(),
  save: async ({ game }, file) => {
    try {
      await game.saveGame(file);
    } catch (e) {}
  },
  load: async ({ game }, file) => {
    try {
      await game.loadGame(file);
    } catch (e) {}
  },
  get: ({ game, log }, key) => {
    try {
      const value = game.getValue(key);
      if (value !== undefined) {
        log.addMessage(value);
      } else {
        log.addMessage(
          `{yellow-fg}${key}{/yellow-fg} not found or not defined`
        );
      }
    } catch (e) {
      log.addMessage(`{red-fg}Error:{/red-fg} ${e}`);
    }
  },
};

/**
 * List of autocompletion functions per command
 * They receive only the parameters part (not the command itself) and return
 * the text that should replace it
 */
const autocompleteMap: {
  [command: string]: (log: Log, text: string, game: Game) => string;
} = {
  get: (log, text, game) => {
    const firstOptions = ['currentStory', 'local.', 'global.'];
    const firstPoint = text.indexOf('.');
    const firstPart = firstPoint === -1 ? text : text.substring(0, firstPoint);
    const secondPart = firstPoint === -1 ? '' : text.substring(firstPoint + 1);

    const autocompletedFirstPartResult = getAutocompletion(
      log,
      firstPart,
      firstOptions
    );
    let autocompletedSecondPart = '';
    if (
      autocompletedFirstPartResult.exact &&
      autocompletedFirstPartResult.text !== 'currentStory'
    ) {
      autocompletedSecondPart = getAutocompletion(
        log,
        secondPart,
        game.getValueList(
          autocompletedFirstPartResult.text.replace('.', '') as
            | 'local'
            | 'global'
        )
      ).text;
    }

    return `${autocompletedFirstPartResult.text}${autocompletedSecondPart}`;
  },
};

export const availableCommands = Object.keys(commandMap);

/**
 * Executes a command
 */
export function processCommand(text: string, log: Log, game: Game): void {
  if (!/^\s*\/([a-z_0-9]+)\s*(.*)/i.test(text)) {
    log.addMessage(`Syntax error. Try with {yellow-fg}/help{/yellow-fg}`);
    return;
  }

  const command = RegExp.$1;
  const args = tokenizer(RegExp.$2);
  const fn = commandMap[command];

  log.scrollTo(Infinity);
  log.addMessage(`{blue-fg}${text}{/blue-fg}`);
  if (fn) {
    fn({ log, game }, ...args);
  } else {
    log.addMessage(`Unknown command {yellow-fg}/${command}{/yellow-fg}`);
  }
}

/**
 * Takes a text input in the Log terminal and search for a command to autocomplete
 * If the command is already input, tries to provide extra information if available
 */
export function autocompleteCommand(
  text: string,
  log: Log,
  game: Game
): string {
  const firstSpace = text.indexOf(' ');
  const command = firstSpace === -1 ? text : text.substring(0, firstSpace);
  const commandWithoutSlash = command[0] === '/' ? command.substr(1) : command;
  const params = firstSpace === -1 ? '' : text.substring(firstSpace + 1);

  const autocompletedCommandResult = getAutocompletion(
    log,
    commandWithoutSlash,
    availableCommands
  );
  const autocompletedCommand = autocompletedCommandResult.exact
    ? `${autocompletedCommandResult.text} `
    : autocompletedCommandResult.text;
  let autocompletedParams = '';

  if (autocompletedCommandResult.exact) {
    const paramsAutocompleteFn = autocompleteMap[commandWithoutSlash];
    if (paramsAutocompleteFn) {
      autocompletedParams = paramsAutocompleteFn(log, params, game);
    }
  }

  const separator = autocompletedCommandResult.exact ? ' ' : '';

  return `/${autocompletedCommand.trim()}${separator}${autocompletedParams}`;
}

/**
 * Print in screen a list of suggestions when the autocomplete
 * is triggered with more than 1 possibility
 */
function suggestCommands(log: Log, commands?: string[]): void {
  if (!commands || commands.length === 0) return;
  log.addMessage(commands.join(' '));
}

/**
 * Given a list of options and a text, try to autocomplete the text
 *
 * @param text Text to autocomplete
 * @param options List of possible options
 * @return replacement text
 */
function getAutocompletion(
  log: Log,
  text: string,
  options: string[]
): AutocompletionResult {
  const lcText = text.toLowerCase();
  const matchingOptions = options.filter(option =>
    option.toLowerCase().startsWith(lcText)
  );

  if (matchingOptions.length === 1) {
    return {
      text: matchingOptions[0],
      exact: true,
    };
  } else if (matchingOptions.length > 1) {
    suggestCommands(log, matchingOptions);
    // check how much we can autocomplete
    let matchingPart = text;
    for (let c = text.length; true; c++) {
      let char = options[0][c];
      if (matchingOptions.some(option => char !== option[c])) {
        break;
      }
      matchingPart += char;
    }
    return { text: matchingPart };
  }
  return {
    text,
  };
}
