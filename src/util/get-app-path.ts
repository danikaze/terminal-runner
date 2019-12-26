import { existsSync } from 'fs';
import { join, dirname } from 'path';

let cachedResult: string;

/**
 * Return the path for the project base
 * It's detected by the existence of the package.json file in any of the parent folders
 * Returns `undefined` if can't be resolved
 */
export function getAppPath(): string | undefined {
  if (cachedResult) {
    return cachedResult;
  }

  const filesToDetect = ['package.json', 'COMMITHASH', 'VERSION'];
  let current = __dirname;
  let fileCheck;

  for (const file of filesToDetect) {
    fileCheck = join(current, file);
    if (existsSync(fileCheck)) {
      cachedResult = current;
      return current;
    }
  }

  current = dirname(current);
  while (current) {
    for (const file of filesToDetect) {
      fileCheck = join(current, file);
      if (existsSync(fileCheck)) {
        cachedResult = current;
        return current;
      }
    }

    current = dirname(current);
  }
}
