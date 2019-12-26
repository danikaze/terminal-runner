import { assert } from 'chai';
import { clamp } from '../clamp';

describe('#clamp', () => {
  // tslint:disable: no-magic-numbers

  it('clamp inside range', () => {
    assert.equal(clamp(4, 3, 7), 4);
    assert.equal(clamp(5, 3, 7), 5);
    assert.equal(clamp(6, 3, 7), 6);
  });

  it('clamp in borders', () => {
    assert.equal(clamp(3, 3, 7), 3);
    assert.equal(clamp(7, 3, 7), 7);
  });

  it('clamp outside range', () => {
    assert.equal(clamp(2, 3, 7), 3);
    assert.equal(clamp(8, 3, 7), 7);
  });
});
