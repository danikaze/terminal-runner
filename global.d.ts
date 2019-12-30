// Globals from constants.js
declare const APP_VERSION: string;
declare const IS_SERVER: string;

// Globals from webpack
declare const IS_PRODUCTION: boolean;
declare const GIT_VERSION: string;
declare const GIT_COMMITHASH: string;
declare const GIT_BRANCH: string;
declare const __non_webpack_require__: NodeRequireFunction;

// Shared Interfaces
type Dict = { [key: string]: unknown };
type NonEmptyArray<T> = [T, ...T[]];
