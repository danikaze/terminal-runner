import {
  MersenneTwister19937,
  shuffle,
  integer,
  Distribution,
  pick,
} from 'random-js';

interface RngOptions {
  /** Initial seed of the RNG */
  seed?: number;
  /** Initial state of the RNG */
  discard?: number;
}

interface RngStatus {
  seed: number;
  usedCount: number;
}

export class Rng {
  protected readonly engine: MersenneTwister19937;
  protected readonly i100: Distribution<number>;
  private readonly seed: number;

  constructor(options?: RngOptions) {
    // tslint:disable: no-magic-numbers

    // engine initialization
    this.seed = (options && options.seed) || Date.now();
    this.engine = MersenneTwister19937.seed(this.seed);
    if (options && options.discard) {
      this.engine.discard(options.discard);
    }

    // used distributions
    this.i100 = integer(0, 99);
  }

  /**
   * Returns the seed and the number of times that the Engine has been used
   */
  public getStatus(): RngStatus {
    return {
      seed: this.seed,
      usedCount: this.engine.getUseCount(),
    };
  }

  /**
   * Gets a boolean based on the given chance
   *
   * The chance is expressed as a percentage or the number of winning possibilities out of a total
   * being 50 out of 100 by default (50%)
   */
  public bool(chances: number = 50, total: number = 100): boolean {
    // tslint:disable: no-magic-numbers
    const probability = chances / total;

    return this.i100(this.engine) < probability * 100;
  }

  /**
   * Returns an integer between `Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`
   */
  public integer(): number;

  /**
   * Returns an integer between [0, max]
   */
  public integer(max: number): number;

  /**
   * Returns an integer number between [min, max]
   */
  public integer(min: number, max: number): number;

  public integer(a?: number, b?: number): number {
    if (typeof a === 'undefined') {
      return this.engine.next();
    }

    const distribution =
      typeof b === 'undefined' ? integer(0, a) : integer(a, b as number);

    return distribution(this.engine);
  }

  /**
   * Returns a random value within the provided ones
   */
  public pick<T>(values: T[]): T {
    return pick(this.engine, values);
  }

  /**
   * Get one of the provided options based on their weight
   */
  public weightedPick<T>(values: { data: T; weight: number }[]): T {
    const total = values.reduce((total, option) => total + option.weight, 0);
    const value = this.integer(1, total);

    for (const option of values) {
      if (value <= option.weight) {
        return option.data;
      }
    }
    return values[values.length - 1].data;
  }

  /**
   * Shuffles an array modifying it
   */
  public shuffle<T>(data: T[]): T[] {
    return shuffle(this.engine, data);
  }
}
