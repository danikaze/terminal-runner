import { assert } from 'chai';
import { tokenizer } from '../tokenizer';

describe('#tokenizer', () => {
  it('basic splitting', () => {
    assert.deepEqual(tokenizer('this is a simple text'), [
      'this',
      'is',
      'a',
      'simple',
      'text',
    ]);
    assert.deepEqual(tokenizer('this-is-a-simple-text', { separator: '-' }), [
      'this',
      'is',
      'a',
      'simple',
      'text',
    ]);
  });

  it('multiple spaces', () => {
    assert.deepEqual(tokenizer('this is  a   simple  text'), [
      'this',
      'is',
      'a',
      'simple',
      'text',
    ]);
    assert.deepEqual(
      tokenizer('this--is-a---simple--text', { separator: '-' }),
      ['this', 'is', 'a', 'simple', 'text']
    );
  });

  it('trim text', () => {
    assert.deepEqual(tokenizer('  spaces  '), ['spaces']);
  });

  it('joined text', () => {
    assert.deepEqual(tokenizer('this "is a  simple" text'), [
      'this',
      'is a  simple',
      'text',
    ]);
    assert.deepEqual(
      tokenizer('this-"is a--simple"-text', { separator: '-' }),
      ['this', 'is a--simple', 'text']
    );
    assert.deepEqual(tokenizer(`this joiner " doesn't close`), [
      'this',
      'joiner',
      '"',
      `doesn't`,
      'close',
    ]);
    assert.deepEqual(tokenizer(`joiner chars al"so sepa"rate`), [
      'joiner',
      'chars',
      'al',
      'so sepa',
      'rate',
    ]);
    assert.deepEqual(tokenizer(`empty "" joiner`), ['empty', '', 'joiner']);
  });

  it('escaped text', () => {
    assert.deepEqual(tokenizer(`this "is a \\"escaped" \\\\text`), [
      'this',
      'is a "escaped',
      '\\text',
    ]);
    assert.deepEqual(
      tokenizer('this-|is-a-^|escaped|--text', {
        escape: '^',
        separator: '-',
        joiner: '|',
      }),
      ['this', 'is-a-|escaped', 'text']
    );
    assert.deepEqual(tokenizer(`escape "before the\\"" end`), [
      'escape',
      'before the"',
      'end',
    ]);
  });
});
