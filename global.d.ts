// Globals from constants.js
declare const APP_NAME: string;
declare const APP_VERSION: string;
declare const IS_SERVER: string;

/**
 * Globals from webpack
 */
// build mode is production
declare const IS_PRODUCTION: boolean;
// code is meant to be packed with zeit/pkg
declare const IS_PACKAGE: boolean;
// short git commit hash
declare const GIT_VERSION: string;
// long git commit hash
declare const GIT_COMMITHASH: string;
// git branch where the build was executed from
declare const GIT_BRANCH: string;
// external require function (runtime require)
declare const __non_webpack_require__: NodeRequireFunction;

// Shared Interfaces
type Dict = { [key: string]: unknown };
type NonEmptyArray<T> = [T, ...T[]];
