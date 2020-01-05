import { assert } from 'chai';
import { alignCenter } from '../format';

describe('#format.alignCenter', () => {
  it('centers empty string', () => {
    assert.equal(alignCenter('', 0), '');
    assert.equal(alignCenter('', 5), '     ');
    assert.equal(alignCenter('', 5, 'x'), 'xxxxx');
  });

  it('centers normal string', () => {
    assert.equal(alignCenter('str', 4), 'str ');
    assert.equal(alignCenter('str', 5), ' str ');
    assert.equal(alignCenter('str', 6), ' str  ');

    assert.equal(alignCenter('str', 4, '_'), 'str_');
    assert.equal(alignCenter('str', 5, '_'), '_str_');
    assert.equal(alignCenter('str', 6, '_'), '_str__');
  });

  it('does nothing if the string is bigger or equal than the provided space', () => {
    assert.equal(alignCenter('str', 0), 'str');
    assert.equal(alignCenter('str', 1), 'str');
    assert.equal(alignCenter('str', 2), 'str');
    assert.equal(alignCenter('str', 3), 'str');
  });
});
