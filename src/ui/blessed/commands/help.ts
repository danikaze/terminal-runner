import { CommandFunction } from '.';

export const command: CommandFunction = ({ log }) => {
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
};
