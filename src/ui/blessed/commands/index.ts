import { tokenizer } from 'util/tokenizer';
import { Game } from 'engine/game';
import { Log } from '../widgets/log';
import { getAutocompletion } from '../util/autocomplete';
import { command as helpCommand } from './help';
import { command as getCommand, autocomplete as getAutocomplete } from './get';
import { command as saveCommand } from './save-game';
import {
  command as loadCommand,
  autocomplete as loadAutocomplete,
} from './load-game';

export type AutocompleteFunction = (data: CommandData, text: string) => string;

export type CommandFunction = (
  data: CommandData,
  ...args: string[]
) => void | Promise<void>;

interface CommandData {
  log: Log;
  game: Game;
}

/**
 * List of available commands
 */
const commandMap: {
  [command: string]: CommandFunction;
} = {
  exit: ({ game }) => game.quit(),
  clear: ({ log }) => log.clear(),
  help: helpCommand,
  save: saveCommand,
  load: loadCommand,
  get: getCommand,
};

/**
 * List of autocompletion functions per command
 * They receive only the parameters part (not the command itself) and return
 * the text that should replace it
 */
const autocompleteMap: {
  [command: string]: AutocompleteFunction;
} = {
  get: getAutocomplete,
  load: loadAutocomplete,
};

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
    Object.keys(commandMap)
  );
  const autocompletedCommand = autocompletedCommandResult.exact
    ? `${autocompletedCommandResult.text} `
    : autocompletedCommandResult.text;
  let autocompletedParams = '';

  if (autocompletedCommandResult.exact) {
    const paramsAutocompleteFn = autocompleteMap[commandWithoutSlash];
    if (paramsAutocompleteFn) {
      autocompletedParams = paramsAutocompleteFn({ log, game }, params);
    }
  }

  const separator = autocompletedCommandResult.exact ? ' ' : '';

  return `/${autocompletedCommand.trim()}${separator}${autocompletedParams}`;
}
