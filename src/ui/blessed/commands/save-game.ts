import { CommandFunction } from '.';

/**
 * Save the game status to the specified savegame file
 */
export const command: CommandFunction = async ({ game }, file) => {
  try {
    await game.saveGame(file);
  } catch (e) {}
};
