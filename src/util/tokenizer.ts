export interface TokenizerOptions {
  escape: string;
  separator: string;
  joiner: string;
}

/**
 * Split a text into an array of strings based on the parameters
 */
export function tokenizer(
  text: string,
  options?: Partial<TokenizerOptions>
): string[] {
  const opt: TokenizerOptions = {
    escape: '\\',
    separator: ' ',
    joiner: '"',
    ...options,
  };

  const result: string[] = [];
  let current = '';
  let joining = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    switch (char) {
      case opt.escape:
        if (escaped) {
          current += char;
        }
        escaped = !escaped;
        break;

      case opt.joiner:
        if (escaped) {
          escaped = false;
          current += char;
        } else if (!joining) {
          // lookup for a matching closing joiner char
          let closes = false;
          let matchingIndex = text.indexOf(opt.joiner, i + 1);
          while (!closes && matchingIndex !== -1) {
            if (text[matchingIndex - 1] !== opt.escape) {
              closes = true;
            }
            matchingIndex = text.indexOf(opt.joiner, matchingIndex + 1);
          }

          if (closes) {
            joining = true;
            if (current !== '') {
              result.push(current);
              current = '';
            }
          } else {
            current += char;
          }
        } else {
          // when between joiners, empty strings can be returned
          result.push(current);
          current = '';
          joining = false;
        }
        break;

      case opt.separator:
        if (joining) {
          current += char;
        } else if (current !== '') {
          result.push(current);
          current = '';
        }
        break;

      default:
        current += char;
    }
  }

  if (current !== '') {
    result.push(current);
  }

  return result;
}
