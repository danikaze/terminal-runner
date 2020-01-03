export type WidgetRule = {
  /** Starting column */
  x: number;
  /** Starting row */
  y: number;
  /** Number of colums to use */
  width: number;
  /** Number of rows to use */
  height: number;
};

export type LayoutRuleType = 'console' | 'text' | 'userSelect';
export type LayoutRules = { [key in LayoutRuleType]: WidgetRule };

export const N_COLS = 12;
export const N_ROWS = 12;

export const rules: LayoutRules = {
  console: {
    x: 0,
    y: 0,
    width: 12,
    height: 5,
  },
  text: {
    x: 1,
    y: 5,
    width: 7,
    height: 3,
  },
  userSelect: {
    x: 0,
    y: 7,
    width: 12,
    height: 5,
  },
};
