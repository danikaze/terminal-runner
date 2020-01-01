import { CommandFunction, AutocompleteFunction } from '.';
import { getAutocompletion } from '../util/autocomplete';

/**
 * Load the game status from the specified savegame file
 */
export const command: CommandFunction = async ({ game }, file) => {
  try {
    await game.loadGame(file);
  } catch (e) {}
};

export const autocomplete: AutocompleteFunction = ({ game, log }, text) => {
  return getAutocompletion(log, text, game.getSaveGameList()).text;
};
