import chalk from 'chalk'

export function getColors() {
  return {
    item: chalk.white.bgHex('#272822'),
    selectedItem: (s: string) => s, // TODO: syntax highlighting
    scrollArea: chalk.bgHex('#272822'),
    scrollBar: chalk.whiteBright
  }
}
