import { getAutocompletion } from '../util/autocomplete';
import { CommandFunction, AutocompleteFunction } from '.';

/**
 * Get the value of the specified Game system variable
 */
export const command: CommandFunction = ({ game, log }, key) => {
  try {
    const value = game.getValue(key);
    if (value !== undefined) {
      log.addMessage(value);
    } else {
      log.addMessage(`{yellow-fg}${key}{/yellow-fg} not found or not defined`);
    }
  } catch (e) {
    log.addMessage(`{red-fg}Error:{/red-fg} ${e}`);
  }
};

export const autocomplete: AutocompleteFunction = ({ game, log }, text) => {
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
        autocompletedFirstPartResult.text.replace('.', '') as 'local' | 'global'
      )
    ).text;
  }

  return `${autocompletedFirstPartResult.text}${autocompletedSecondPart}`;
};
