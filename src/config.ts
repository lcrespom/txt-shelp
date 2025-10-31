import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const Config = {
  menuRow: 2,
  lineEditOverMenu: false,
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
    if (!isNaN(row)) Config.menuRow = row
    if (Config.menuRow == 1) Config.menuRow = 2 // Nasty table-menu bug
  }
  if (configMap.ZEEK_MENU_SIZE) {
    const sizes = configMap.ZEEK_MENU_SIZE.split('x')
    if (sizes.length === 2) {
      const width = parseInt(sizes[0], 10)
      const height = parseInt(sizes[1], 10)
      if (!isNaN(width) && !isNaN(height)) {
        Config.menuWidth = width
        Config.menuHeight = height
      }
    }
  }
  if (configMap.ZEEK_LINE_EDIT_OVER_MENU) {
    const val = configMap.ZEEK_LINE_EDIT_OVER_MENU.toLowerCase()
    Config.lineEditOverMenu = val === 'true' || val === '1' || val === 'yes'
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
