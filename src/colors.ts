import chalk from 'chalk'
import { highlightCommand } from './syntax-highlight.ts'

export function getColors() {
  return {
    item: (i: string) => chalk.white.bgHex('#272822')(highlightCommand(i)),
    // item: chalk.white.bgHex('#272822'),
    selectedItem: chalk.inverse,
    scrollArea: chalk.bgHex('#272822'),
    scrollBar: chalk.whiteBright
  }
}
