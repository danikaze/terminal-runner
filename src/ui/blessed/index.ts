import { screen, Widgets } from 'blessed';
import { GameUi, InitData, SelectData, SelectOptions } from 'engine/model/ui';
import { Rng } from 'util/rng';

export class TerminalUi implements GameUi {
  private readonly rng: Rng;
  private screen!: Widgets.Screen;

  constructor(data: InitData) {
    this.rng = data.rng;
  }

  public async start(): Promise<void> {
    this.screen = screen({ smartCSR: true });
    this.screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
    this.screen.render();
  }

  public async end(): Promise<void> {}

  public async userSelect<T>(
    data: NonEmptyArray<SelectData<T>>,
    options?: SelectOptions<T>
  ): Promise<T> {
    const selectOptions =
      options && options.randomSort ? this.rng.shuffle(data) : data;

    return (this.rng.pick(selectOptions) as SelectData<T>).data;
  }
}
