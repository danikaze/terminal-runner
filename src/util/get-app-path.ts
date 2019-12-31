/**
 * Return the path for the project base
 */
export function getAppPath(): string {
  // by using webpack, this file will always be inside the bundled `index.js`
  return __dirname;
}
