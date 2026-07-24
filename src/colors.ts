/**
 * ANSI color utilities for terminal output.
 * Zero dependencies — uses raw escape codes.
 */

const isColorSupported = process.stdout.isTTY !== false;

function wrap(code: string, text: string): string {
  if (!isColorSupported) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}

export const c = {
  bold:    (t: string) => wrap('1', t),
  dim:     (t: string) => wrap('2', t),
  green:   (t: string) => wrap('32', t),
  yellow:  (t: string) => wrap('33', t),
  blue:    (t: string) => wrap('34', t),
  magenta: (t: string) => wrap('35', t),
  cyan:    (t: string) => wrap('36', t),
  red:     (t: string) => wrap('31', t),
  gray:    (t: string) => wrap('90', t),
};

