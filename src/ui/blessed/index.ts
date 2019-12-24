import { GameUi, InitData, SelectData, SelectOptions } from 'engine/model/ui';
import { Rng } from 'util/rng';

export class TerminalUi implements GameUi {
  private readonly rng: Rng;

  constructor(data: InitData) {
    this.rng = data.rng;
  }

  public async start(): Promise<void> {}

  public async end(): Promise<void> {}

  public async userSelect<T>(
    data: SelectData<T>[],
    options?: SelectOptions<T>
  ): Promise<T> {
    const selectOptions =
      options && options.randomSort ? this.rng.shuffle(data) : data;

    return selectOptions[0] && selectOptions[0].data;
  }
}
