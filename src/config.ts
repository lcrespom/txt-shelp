import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const Config = {
  menuRow: 3,
  lineEditorRow: 1,
  menuWidth: 80,
  menuHeight: 40,
  maxCmdHistoryLines: 1000,
  maxDirHistoryLines: 1000
}

export function initConfig(): boolean {
  if (!process.env.ZEEK_DIR) return false
  try {
    // Read zeek.zsh and gather any line with a variable starting with ZEEK_
    const lines = readFileSync(join(process.env.ZEEK_DIR, 'zeek.zsh'), 'utf-8')
      .split('\n')
      .filter(line => line.match(/^ZEEK_[_a-zA-Z0-9]+=/))
    // Build a config object with one property per variable
    const configMap: Record<string, string> = {}
    for (let line of lines) {
      const [key, value] = line.split('=')
      configMap[key] = value
        .trim()
        .replace(/^["']|["']$/g, '')
        .trim()
    }
    // Parse and apply config
    applyConfig(configMap)
    return true
  } catch {
    return false
  }
}

function applyConfig(configMap: Record<string, string>) {
  if (configMap.ZEEK_MENU_ROW) {
    const row = parseInt(configMap.ZEEK_MENU_ROW, 10)
    if (!isNaN(row)) {
      Config.menuRow = row
      Config.lineEditorRow = row - 2
    }
  }
  if (configMap.ZEEK_MENU_SIZE) {
    const sizeMatch = configMap.ZEEK_MENU_SIZE.match(/^(\d+)x(\d+)$/)
    if (sizeMatch) {
      const width = parseInt(sizeMatch[1], 10)
      const height = parseInt(sizeMatch[2], 10)
      if (!isNaN(width) && !isNaN(height)) {
        Config.menuWidth = width
        Config.menuHeight = height
      }
    }
  }
  if (configMap.ZEEK_MAX_CMD_HISTORY_LINES) {
    const maxCmdLines = parseInt(configMap.ZEEK_MAX_CMD_HISTORY_LINES, 10)
    if (!isNaN(maxCmdLines)) Config.maxCmdHistoryLines = maxCmdLines
  }
  if (configMap.ZEEK_MAX_DIR_HISTORY_LINES) {
    const maxDirLines = parseInt(configMap.ZEEK_MAX_DIR_HISTORY_LINES, 10)
    if (!isNaN(maxDirLines)) Config.maxDirHistoryLines = maxDirLines
  }
}
