import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { tableMenu } from 'node-terminal-menu'

import { getColors } from './colors.ts'

function removeTimestamp(line: string): string {
  const timestampRegex = /^:?\s?\d+:\d+;/
  return line.replace(timestampRegex, '')
}

function removeDuplicates(lines: string[]): string[] {
  return [...new Set(lines.reverse())].reverse()
}

export function getHistoryLines(maxLines: number = 1000): string[] {
  const historyFile = join(process.env.HOME || process.env.USERPROFILE || '', '.zsh_history')
  const output = execSync(`tail -n ${maxLines} "${historyFile}"`, { encoding: 'utf-8' })
  return removeDuplicates(
    output
      .split('\n: ')
      .map(item => item.split('\n').join(''))
      .map(removeTimestamp)
  )
}

export function showHistoryPopup(menuDone: (line?: string) => void) {
  const items = getHistoryLines()
  const maxWidth = items.reduce((max, item) => Math.max(max, item.length), 0)
  const height = Math.min(process.stdout.rows - 10, items.length)
  const width = Math.min(process.stdout.columns - 5, maxWidth + 1)
  return tableMenu({
    items,
    height,
    columns: 1,
    columnWidth: width,
    scrollBarCol: width + 1,
    selection: items.length - 1,
    colors: getColors(),
    done: (item: number) => {
      const line = item >= 0 ? items[item] : undefined
      menuDone(line)
    }
  })
}
