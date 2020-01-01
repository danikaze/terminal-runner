import { Log } from '../widgets/log';

export interface AutocompletionResult {
  text: string;
  exact?: boolean;
}

/**
 * Given a list of options and a text, try to autocomplete the text
 *
 * @param text Text to autocomplete
 * @param options List of possible options
 * @return replacement text
 */
export function getAutocompletion(
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
  }
  if (matchingOptions.length > 1) {
    suggestCommands(log, matchingOptions);
    // check how much we can autocomplete
    let matchingPart = text;
    for (let c = text.length; true; c++) {
      const char = options[0][c];
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

/**
 * Print in screen a list of suggestions when the autocomplete
 * is triggered with more than 1 possibility
 */
function suggestCommands(log: Log, commands: string[]): void {
  log.addMessage(commands.join(' '));
}
