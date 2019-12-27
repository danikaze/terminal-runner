import { KeyDeclaration } from '../keys';

export const declarations: { [key: string]: KeyDeclaration } = {
  a: { char: 'a' },
  A: { char: 'A' },
  'macM-a': { char: 'å' },
  'macM-a2': { full: 'å' },
  'S-A': { key: 'a', shift: true },
  'C-c': { key: 'c', ctrl: true },
  'C-C': { key: 'c', ctrl: true },
  'C-S-a': { key: 'c', ctrl: true, shift: true },
  up: { key: 'up' },
  'C-up': { key: 'up', ctrl: true },
  'M-up': { key: 'up', meta: true },
  'S-up': { key: 'up', shift: true },
  enter: { key: 'enter' },
  backspace: { key: 'backspace' },
  space: { key: 'space' },
  ' ': { char: ' ' },
  escape: { key: 'escape' },
};
