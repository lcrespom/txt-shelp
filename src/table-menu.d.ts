declare module 'node-terminal-menu' {
  /**
   * Color function that transforms a string (e.g., applies ANSI color codes)
   */
  export type ColorFunction = (text: string) => string

  /**
   * Color configuration for the table menu
   */
  export interface TableMenuColors {
    /**
     * Color function for regular menu items
     * @default identity function (no coloring)
     */
    item?: ColorFunction

    /**
     * Color function for the selected menu item
     * @default inverse video
     */
    selectedItem?: ColorFunction

    /**
     * Color function for the scroll area
     * @default identity function (no coloring)
     */
    scrollArea?: ColorFunction

    /**
     * Color function for the scroll bar
     * @default identity function (no coloring)
     */
    scrollBar?: ColorFunction

    /**
     * Color function for item descriptions
     * @default identity function (no coloring)
     */
    desc?: ColorFunction
  }

  /**
   * Key event object
   */
  export interface KeyEvent {
    name: string
    shift?: boolean
  }

  /**
   * Menu object returned by tableMenu
   */
  export interface TableMenuInstance {
    /**
     * Key event handler for the menu
     */
    keyHandler: (ch: string | undefined, key: KeyEvent | undefined) => void

    /**
     * Update the menu with new configuration
     */
    update: (menuConfig: TableMenuConfig) => TableMenuInstance

    /**
     * Current selection index
     */
    selection: number
  }

  /**
   * Configuration object for creating a table menu
   */
  export interface TableMenuConfig {
    /**
     * Array of menu items to display
     */
    items: string[]

    /**
     * Number of columns in the table
     */
    columns: number

    /**
     * Width of each column (including gap)
     */
    columnWidth: number

    /**
     * Height of the visible menu area in rows
     * @default all rows if not specified
     */
    height?: number

    /**
     * Initial height (used internally to remember first menu height)
     */
    initialHeight?: number

    /**
     * Initial/current selection index
     * @default 0
     */
    selection?: number

    /**
     * Starting row for scrolling (used internally)
     */
    scrollStart?: number

    /**
     * Column position for the scroll bar
     * If undefined, no scroll bar is shown
     */
    scrollBarCol?: number

    /**
     * Array of descriptions for each menu item
     * Descriptions are shown below the menu when an item is selected
     */
    descs?: (string | undefined)[]

    /**
     * Number of rows reserved for descriptions (computed automatically)
     */
    descRows?: number

    /**
     * Color configuration
     */
    colors?: TableMenuColors

    /**
     * Callback function called when user makes a selection or cancels
     * @param selection - Selected item index, or -1 if cancelled
     */
    done?: (selection: number) => void

    /**
     * Menu instance (used internally for updates)
     */
    menu?: TableMenuInstance

    /**
     * Previous selection (used internally)
     */
    oldSel?: number

    /**
     * Total number of rows (computed from items.length / columns)
     */
    rows?: number
  }

  /**
   * Result of computing table layout
   */
  export interface TableLayout {
    /**
     * Total number of rows needed
     */
    rows: number

    /**
     * Number of columns that fit in the terminal width
     */
    columns: number

    /**
     * Width of each column (including gap)
     */
    columnWidth: number
  }

  /**
   * Creates an interactive table menu
   * @param menuConfig - Configuration for the menu
   * @param updating - Internal parameter, indicates if this is an update operation
   * @returns Menu instance with keyHandler, update method, and selection
   */
  export function tableMenu(menuConfig: TableMenuConfig, updating?: boolean): TableMenuInstance

  /**
   * Computes optimal table layout based on items and terminal width
   * @param items - Array of menu items
   * @param gap - Space between columns (default: 2)
   * @param totalWidth - Total width available (default: process.stdout.columns)
   * @returns Layout configuration with rows, columns, and columnWidth
   */
  export function computeTableLayout(
    items: string[],
    gap?: number,
    totalWidth?: number
  ): TableLayout
}
