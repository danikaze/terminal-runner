import * as blessed from 'blessed';

/*
 * All the High-Level widgets of the blessed UI must implement a constructor
 * accepting options which extend this interface.
 *
 * This way, this widgets will receive the size and position
 * from the parent element/ui/layout
 */
export interface WidgetOptions {
  /** Blessed screen where to render the widget */
  screen: blessed.Widgets.Screen;
  /** Absolute horizontal position of the screen */
  x: number;
  /** Absolute vertical position of the screen */
  y: number;
  /** Width of the widget */
  width: number;
  /** Height of the widget */
  height: number;
}
