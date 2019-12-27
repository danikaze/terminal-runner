import * as blessed from 'blessed';

/*
 * Definitions of keys given by blessed
 */
export type KeyEvent = blessed.Widgets.Events.IKeyEventArg;
export type MacKeyEvent = { ch: string; full: string };
export type Key = [string | null, KeyEvent | MacKeyEvent];

export const definitions: { [name: string]: Key } = {
  a: [
    'a',
    {
      ctrl: false,
      full: 'a',
      meta: false,
      name: 'a',
      sequence: 'a',
      shift: false,
    },
  ],
  A: [
    'A',
    {
      ctrl: false,
      full: 'S-a',
      meta: false,
      name: 'a',
      sequence: 'A',
      shift: true,
    },
  ],
  'M-A': [
    null,
    {
      sequence: '\u001ba',
      name: 'a',
      ctrl: false,
      meta: true,
      shift: false,
      full: 'M-a',
    },
  ],
  'S-A': [
    'A',
    {
      sequence: 'A',
      name: 'a',
      ctrl: false,
      meta: false,
      shift: true,
      full: 'S-a',
    },
  ],
  'C-c': [
    '\u0003',
    {
      sequence: '\u0003',
      name: 'c',
      ctrl: true,
      meta: false,
      shift: false,
      full: 'C-c',
    },
  ],
  'C-C': [
    '\u0003',
    {
      sequence: '\u0003',
      name: 'c',
      ctrl: true,
      meta: false,
      shift: false,
      full: 'C-c',
    },
  ],
  'C-S-a': [
    '\u0001',
    {
      sequence: '\u0001',
      name: 'a',
      ctrl: true,
      meta: false,
      shift: false,
      full: 'C-a',
    },
  ],
  up: [
    null,
    {
      sequence: '\u001bOA',
      name: 'up',
      ctrl: false,
      meta: false,
      shift: false,
      full: 'up',
    },
  ],
  'C-up': [
    null,
    {
      sequence: '\u001b[1;5A',
      name: 'up',
      ctrl: true,
      meta: false,
      shift: false,
      full: 'C-up',
    },
  ],
  'M-up': [
    null,
    {
      sequence: '\u001b\u001b[A',
      name: 'up',
      ctrl: false,
      meta: false,
      shift: false,
      full: 'up',
    },
  ],
  'S-up': [
    null,
    {
      sequence: '\u001b[1;2A',
      name: 'up',
      ctrl: false,
      meta: false,
      shift: true,
      full: 'S-up',
    },
  ],
  enter: [
    '\r',
    {
      sequence: '\r',
      name: 'enter',
      ctrl: false,
      meta: false,
      shift: false,
      full: 'enter',
    },
  ],
  backspace: [
    '',
    {
      sequence: '',
      name: 'backspace',
      ctrl: false,
      meta: false,
      shift: false,
      full: 'backspace',
    },
  ],
  space: [
    ' ',
    {
      sequence: ' ',
      name: 'space',
      ctrl: false,
      meta: false,
      shift: false,
      full: 'space',
    },
  ],
  escape: [
    '\u001b',
    {
      sequence: '\u001b',
      name: 'escape',
      ctrl: false,
      meta: false,
      shift: false,
      full: 'escape',
    },
  ],
  // some keys can't be found
  '1': ['1', { ch: '1', full: '1' }],
  'macM-a': ['å', { ch: 'å', full: 'å' }],
};
