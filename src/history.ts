import { execSync } from 'node:child_process'
import { join } from 'node:path'

function removeTimestamp(line: string): string {
  const timestampRegex = /^:?\s?\d+:\d+;/
  return line.replace(timestampRegex, '')
}

export function getHistoryLines(maxLines: number = 100): string[] {
  const historyFile = join(process.env.HOME || process.env.USERPROFILE || '', '.zsh_history')
  const output = execSync(`tail -n ${maxLines} "${historyFile}"`, { encoding: 'utf-8' })
  return output
    .split('\n: ')
    .map(item => item.split('\n').join(''))
    .map(removeTimestamp)
}
