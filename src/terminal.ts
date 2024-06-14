import ansiEscapes from "ansi-escapes";
import styles from "ansi-styles";

export const Terminal = {
  clear: (s?: string) => `${ansiEscapes.clearTerminal}${s}`,
  highlight: (s: string) =>
    `${styles.color.green.open}${styles.modifier.bold.open}${s}${styles.modifier.bold.close}${styles.color.close}`,
  emphasize: (s: string) =>
    `${styles.modifier.bold.open}${s}${styles.modifier.bold.close}`,
  collision: (s: string) =>
    `${styles.color.red.open}${styles.modifier.bold.open}${s}${styles.modifier.bold.close}${styles.color.close}`,
};
