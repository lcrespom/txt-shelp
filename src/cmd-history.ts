import { execSync } from 'node:child_process'
import { join } from 'node:path'

// TODO read from configuration file
const HISTORY_FILE = '.zsh_history'
const MAX_HISTORY_LINES = 1000

function removeTimestamp(line: string): string {
  const timestampRegex = /^:?\s?\d+:\d+;/
  return line.replace(timestampRegex, '')
}

function removeDuplicates(lines: string[]): string[] {
  return [...new Set(lines.reverse())].reverse()
}

export function getCommandHistory(): string[] {
  const historyPath = join(process.env.HOME || process.env.USERPROFILE || '', HISTORY_FILE)
  const output = execSync(`tail -n ${MAX_HISTORY_LINES} "${historyPath}"`, { encoding: 'utf-8' })
  return removeDuplicates(
    output
      .split('\n: ')
      .map(item => item.split('\n').join(''))
      .map(removeTimestamp)
  )
}
