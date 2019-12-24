// Globals from constants.js
declare const APP_VERSION: string;
declare const IS_SERVER: string;

// Globals from webpack
declare const IS_PRODUCTION: boolean;
declare const __non_webpack_require__: NodeRequireFunction;

// Shared Interfaces
type Dict = { [key: string]: unknown };
type NonEmptyArray<T> = [T, ...T[]];
