import { tokenizer } from 'util/tokenizer';

export type CommandCall = (
  addMessage: (msg: string) => void,
  ...args: string[]
) => void;

const commandMap: {
  [command: string]: CommandCall;
} = {
  help: addMessage => {
    const list = availableCommands
      .map(command => `{yellow-fg}${command}{/yellow-fg}`)
      .join(', ');
    addMessage(`Available commands: ${list}`);
    addMessage('Console keys:');
    addMessage(' [ {yellow-fg}`{/yellow-fg} ] Toggle the log/terminal');
    // addMessage(' [ {yellow-fg}TAB{/yellow-fg} ] Auto-complete');
    addMessage(' [ {yellow-fg}C-⬆︎{/yellow-fg} ] Previous command');
    addMessage(' [ {yellow-fg}C-⬇︎{/yellow-fg} ] Next command');
    addMessage(' [ {yellow-fg}S-⬆︎{/yellow-fg} ] Shrink terminal');
    addMessage(' [ {yellow-fg}S-⬇︎{/yellow-fg} ] Expand terminal');
    addMessage(' [ {yellow-fg}⬆︎{/yellow-fg} ] Scroll log messages up');
    addMessage(' [ {yellow-fg}⬇︎{/yellow-fg} ] Scroll log messages down');
  },
  echo: (addMessage, ...args) => {
    addMessage(`{grey-fg}${args.join(' ')}{/grey-fg}`);
  },
  exit: () => process.exit(0),
};

export const availableCommands = Object.keys(commandMap).map(
  command => `/${command}`
);

export function processCommand(
  text: string,
  addMessage: (msg: string) => void
): void {
  if (!/^\s*\/([a-z_0-9]+)\s*(.*)/i.test(text)) {
    addMessage(`Syntax error. Try with {yellow-fg}/help{/yellow-fg}`);
    return;
  }

  const command = RegExp.$1;
  const args = tokenizer(RegExp.$2);
  const fn = commandMap[command];
  if (fn) {
    fn(addMessage, ...args);
  } else {
    addMessage(`Unknown command {yellow-fg}${command}{/yellow-fg}`);
  }
}
