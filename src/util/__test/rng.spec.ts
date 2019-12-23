import { assert } from 'chai';
import { Rng } from '../rng';

describe('#Rng', () => {
  // tslint:disable: no-magic-numbers
  let rng: Rng;

  beforeEach(() => {
    rng = new Rng();
  });

  it('default constructor', () => {
    const rng = new Rng();
    const status = rng.getStatus();

    assert.equal(status.usedCount, 0);
    assert.notEqual(status.seed, 0);
    assert.isNumber(status.seed);
  });

  it('seeded constructor', () => {
    const seed = 12345;
    const rng = new Rng({ seed });
    const status = rng.getStatus();

    assert.equal(status.usedCount, 0);
    assert.equal(status.seed, seed);
  });

  it('status constructor', () => {
    const seed = 12345;
    const discard = 3;
    const rng = new Rng({ seed, discard });
    const status = rng.getStatus();

    assert.equal(status.usedCount, discard);
    assert.equal(status.seed, seed);
  });

  it('bool()', () => {
    assert.isBoolean(rng.bool());
    assert.isBoolean(rng.bool(10));
    assert.isBoolean(rng.bool(1, 3));
    assert.equal(rng.getStatus().usedCount, 3);
  });

  it('integer()', () => {
    const result = rng.integer();
    assert.isNumber(result);
    assert.equal(result % 1, 0);
    assert.isAtLeast(result, Number.MIN_SAFE_INTEGER);
    assert.isAtMost(result, Number.MAX_SAFE_INTEGER);
    assert.equal(rng.getStatus().usedCount, 1);
  });

  it('integer(max)', () => {
    const max = 10;
    const result = rng.integer(max);
    assert.isNumber(result);
    assert.equal(result % 1, 0);
    assert.isAtLeast(result, 0);
    assert.isAtMost(result, max);
    assert.equal(rng.getStatus().usedCount, 1);
  });

  it('integer(min, max)', () => {
    const min = 10;
    const max = 30;
    const result = rng.integer(min, max);
    assert.isNumber(result);
    assert.equal(result % 1, 0);
    assert.isAtLeast(result, min);
    assert.isAtMost(result, max);
    assert.equal(rng.getStatus().usedCount, 1);
  });

  it('pick()', () => {
    const values = [1, 3, 5, 'a', 'b', { a: 1 }, ['array']];
    const result = rng.pick(values);

    assert.isTrue(typeof result !== 'undefined');
    assert.include(values, result);
    assert.equal(rng.getStatus().usedCount, 1);
  });

  it('weightedPick()', () => {
    const values = [
      { data: 1, weight: 1 },
      { data: 'x', weight: 0 },
      { data: 3, weight: 3 },
    ];
    const result = rng.weightedPick<number | string>(values);

    assert.isTrue(typeof result !== 'undefined');
    assert.notEqual(result, 'x');
    assert.notEqual(
      values.findIndex(value => value.data === result),
      -1
    );
    assert.equal(rng.getStatus().usedCount, 1);
  });

  it('shuffle()', () => {
    const array = [1, 2, 3, 4, 5];
    const arrayCopy = [...array];

    const result = rng.shuffle(array);
    assert.equal(result.length, arrayCopy.length);
    assert.equal(rng.getStatus().usedCount, arrayCopy.length - 1);
    for (const value of result) {
      const index = arrayCopy.indexOf(value);
      assert.notEqual(index, -1);
      arrayCopy.splice(index, 1);
    }
    assert.equal(arrayCopy.length, 0);
  });
});
