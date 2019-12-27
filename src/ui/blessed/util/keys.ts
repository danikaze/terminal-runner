import * as blessed from 'blessed';
import { isArray } from 'vanilla-type-check/isArray';

interface KeyDeclarationChar {
  char: string;
}
interface KeyDeclarationFull {
  char?: string;
  // full is only used when the received option is like { ch: 'å', full: 'å' }
  // in this case `key`, `ctrl`, `shift` and `meta` are ignored and only this and ch are used
  full: string;
}
interface KeyDeclarationKey {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  // ALT in Windows, OPTION in Mac
  // Note that Mac doesn't process properly Meta+char because blessed can't find
  // the pressed key due to the resolved characters
  // (i.e. Option-A (å) produces { ch: 'å', full: 'å' })
  meta?: boolean;
}

export type KeyDeclaration =
  | KeyDeclarationChar
  | KeyDeclarationFull
  | KeyDeclarationKey;

/**
 * Allow for complex comparisons between with blessed Key Events
 *
 * If an array of `wanted` declarations are specified, it return trues if it's true for any of them
 *
 * @param wanted key declaration or declarations for the wanted match
 * @param char same as the one incoming from the blessed key event
 * @param key same as the one incoming from the blessed key event
 */
export function compareKey(
  wanted: KeyDeclaration | KeyDeclaration[],
  char: string | null,
  key: blessed.Widgets.Events.IKeyEventArg
): boolean {
  if (!isArray(wanted)) {
    return compareOneKey(wanted, char, key);
  }
  return wanted.some(w => compareOneKey(w, char, key));
}

function compareOneKey(
  wanted: KeyDeclaration,
  char: string | null,
  key: blessed.Widgets.Events.IKeyEventArg
): boolean {
  if ((wanted as KeyDeclarationKey).key) {
    return compareAsKey(wanted as KeyDeclarationKey, key);
  }

  if ((wanted as KeyDeclarationFull).full) {
    return compareAsFull(wanted as KeyDeclarationFull, char, key.full);
  }

  return compareAsChar(wanted as KeyDeclarationChar, char);
}

function compareAsFull(
  wanted: KeyDeclarationFull,
  ch: string | null,
  full: string
): boolean {
  return (!wanted.char || wanted.char === ch) && wanted.full === full;
}

function compareAsChar(
  wanted: KeyDeclarationChar,
  char: string | null
): boolean {
  return wanted.char === char;
}

function compareAsKey(
  wanted: KeyDeclarationKey,
  key: blessed.Widgets.Events.IKeyEventArg
): boolean {
  return (
    (undefined === wanted.key || wanted.key === key.name) &&
    (undefined === wanted.ctrl || wanted.ctrl === key.ctrl) &&
    (undefined === wanted.shift || wanted.shift === key.shift) &&
    (undefined === wanted.meta || wanted.meta === key.meta)
  );
}
