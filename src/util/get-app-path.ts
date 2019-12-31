import { dirname } from 'path';

/**
 * Return the path for the project base
 */
export function getAppPath(): string {
  if (!IS_PACKAGE) {
    // by using webpack, this file will always be inside the bundled `index.js`
    return __dirname;
  }

  // if the app was packed, `process.execPath` is the binary file
  // and it should be at the root folder of the app
  return dirname(process.execPath);
}
