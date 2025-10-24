import chalk from 'chalk'
import { highlightCommand } from './syntax-highlight.ts'

export function getColors() {
  return {
    item: (i: string) => chalk.bgHex('#272822')(highlightCommand(i)),
    selectedItem: chalk.bgHex('#1E3D65'),
    scrollArea: chalk.bgHex('#272822'),
    scrollBar: chalk.whiteBright
  }
}
