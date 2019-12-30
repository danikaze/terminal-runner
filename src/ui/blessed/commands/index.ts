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
    log.addMessage(' [ {yellow-fg}⬆︎{/yellow-fg} ] Scroll log messages up');
    log.addMessage(' [ {yellow-fg}⬇︎{/yellow-fg} ] Scroll log messages down');
  },
  echo: ({ log }, ...args) => {
    log.addMessage(`{grey-fg}${args.join(' ')}{/grey-fg}`);
  },
  clear: ({ log }) => log.clear(),
  exit: () => process.exit(0),
  clear: log => log.clear(),
};

export const availableCommands = Object.keys(commandMap).map(
  command => `/${command}`
);

export function processCommand(text: string, log: Log, game: Game): void {
  if (!/^\s*\/([a-z_0-9]+)\s*(.*)/i.test(text)) {
    log.addMessage(`Syntax error. Try with {yellow-fg}/help{/yellow-fg}`);
    return;
  }

  const command = RegExp.$1;
  const args = tokenizer(RegExp.$2);
  const fn = commandMap[command];
  if (fn) {
    fn({ log, game }, ...args);
  } else {
    log.addMessage(`Unknown command {yellow-fg}/${command}{/yellow-fg}`);
  }
}

export function autocompleteCommand(text: string, log: Log): string {
  const matches = availableCommands.filter(
    command => command.startsWith(text) || command.startsWith(`/${text}`)
  );

  if (matches.length > 1) {
    log.addMessage(matches.join(' '));
  }

  return matches.length === 1 ? `${matches[0]} ` : '';
}
