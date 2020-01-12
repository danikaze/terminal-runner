# terminal-runner

> Terminal based game

Status of the `master` branch:

[![Build Status](https://travis-ci.org/danikaze/terminal-runner.svg?branch=master)](https://travis-ci.org/danikaze/terminal-runner)

## Usage

Installation:

```
npm install
npm build
```

Running the following command will execute the program previously built into the `app` folder.

```
npm start
```

to see all the accepted flags, run it with the `--help` parameter

```
npm start -- --help
```

## Testing

```
npm run test
```

The command will run all the tests found in `__test` folders ending with `.spec.ts`, inside `src`.

Tests are implemented in TypeScript like the rest of the code, using [mocha](https://mochajs.org/) + [chai](https://www.chaijs.com/) + [sinon](https://sinonjs.org/), and it generates coverage report into the `coverage` folder.

## Developing

Running the following command will start the `watch` process which will generate the needed files into the `app` folder.

```
npm run dev
```

The code is placed inside the `src` folder, which structure is broken into four big sub-folders:

- `data`: is for external resources, not related to the Game system, nor the UI itself
- `engine`: is how the game logic works. the Game sytem code is placed here
- `ui`: the UI is not coupled with the game engine, which allows the game engine to be presented in different flavors (terminal-based game, web-based game, etc.)
- `util`: is for library-like functions. Helpers that can be used in any place of the code

### Generating binary files

This project uses [zeit/pkg](https://github.com/zeit/pkg) to build binaries. To prepare the binaries just run

```
npm run pack
```

And the binary files will be generated into the `app/bin` folder.

### Developing on Windows

Terminals usually are not well-supported on windows environments, but for the terminal-ui the project is using a [fork of blessed](https://github.com/danikaze/blessed) which replaces the unsupported [pty.js](https://github.com/chjj/pty.js/) package by [node-pty](https://github.com/microsoft/node-pty).

If you experience any problem while installing the project, just follow the [instructions provided](https://github.com/microsoft/node-pty#windows) in their github page.

### Contributing

Right now the project is in a very-early stage and probably PRs with new features won't be accepted (_[bugfixes, testing and reports](https://github.com/danikaze/terminal-runner/issues) are always welcomed_), but for any idea just [contact the author](https://twitter.com/danikaze).
