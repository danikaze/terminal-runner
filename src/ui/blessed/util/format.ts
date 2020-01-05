/**
 * Add the specified character (by default space) before and after the text
 * to center it in a space of the specified size
 * (basically because blessed doesn't do it properly most of the times)
 */
export function alignCenter(text: string, size: number, filler = ' '): string {
  const padding = filler.repeat(Math.max(0, size / 2 - text.length / 2));
  return `${padding}${text}`.padEnd(size, filler);
}
