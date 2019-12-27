import { assert } from 'chai';
import { isArray } from 'vanilla-type-check/isArray';
import { compareKey, KeyDeclaration } from '../keys';
import { definitions, KeyEvent } from './keys.definitions';
import { declarations } from './keys.declarations';

describe('#compareKey', () => {
  function check(
    wanted: string | string[],
    definition: string,
    expected: boolean
  ): void {
    let w: KeyDeclaration | KeyDeclaration[];
    if (isArray(wanted)) {
      w = wanted.map(w => {
        const k = declarations[w];
        if (!k) {
          throw new Error(`Declaration for key ${k} not found`);
        }
        return k;
      });
    } else {
      w = declarations[wanted];
      if (!w) {
        throw new Error(`Declaration for key ${wanted} not found`);
      }
    }

    const def = definitions[definition];
    if (!def) {
      throw new Error(`Definition for key ${definition} not found`);
    }

    const char = def[0];
    const key = def[1] as KeyEvent;
    const result = compareKey(w, char, key);
    assert.equal(result, expected);
  }

  it('compares single characters', () => {
    check(' ', 'space', true);
    check('a', 'a', true);
    check('A', 'a', false);
    check('a', 'A', false);
    check('A', 'A', true);
    check('S-A', 'A', true);
    check('macM-a', 'macM-a', true);
    check('macM-a2', 'macM-a', true);
  });

  it('compares multiple characters', () => {
    // upercase or lowercase A
    check(['a', 'A'], 'a', true);
    check(['A', 'a'], 'a', true);
  });

  it('compares single key combinations', () => {
    check('S-A', '1', false);
    check('S-A', 'A', true);
    check('S-A', 'S-A', true);
    check('C-c', 'C-c', true);
    check('C-C', 'C-C', true);
    check('C-C', 'C-c', true);
    check('C-c', 'C-C', true);
  });

  it('compares multiple key combinations', () => {
    // when hitting control, shift is false in Mac
    check('C-S-a', 'C-S-a', false);
    check('C-S-a', 'S-A', false);
  });

  it('compares especial keys', () => {
    check('enter', 'enter', true);
    check('backspace', 'backspace', true);
    check('space', 'space', true);
    check('escape', 'escape', true);
    check('C-up', 'C-up', true);
    check('S-up', 'S-up', true);
  });
});
