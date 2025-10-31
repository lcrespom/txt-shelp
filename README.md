# ToDo

- History
  - [x] Gather selection
  - [x] Remove duplicates
  - [x] Create shell script to register keyboard shortcuts and buffer
        replacement
  - [x] Place menu at bottom (negative row config)
  - [x] Support multi-line commands
  - [ ] Underline builtins
  - [ ] Use which when possible (check performance)
  - Filter history
    - [x] Interactive line editor to filter
    - [x] Full keyboard support in interactive line editor (left, right, home,
          end, delete...)
    - [x] Gather initial buffer and use for initial filter
    - [x] Fuzzy filter, shelp style
    - [x] Support placing line editor at the bottom of the menu
  - Colors
    - [x] Shell parser
    - [x] Syntax highlight lines
    - [x] Show syntax highlight in selection, just change background
    - [x] Highlight full line
    - [ ] Highlight matched text (complex)
    - [ ] Make palette configurable
    - [ ] memoize highlighted lines => just memoize which, when implemented
- Dir History
  - [x] Create shell script part to add dirs to ~/.dir_history
  - [x] Implement menu
  - [x] `cd` to selection
- Misc
  - [x] Capture all exceptions and show cursor before exiting
  - [x] Use alternate screen buffer
  - [x] Other navigation shortcuts
  - [x] Read configuration from config file
  - [ ] Documentation
- Bugs
  - [x] Fix bug: empty item list
  - [x] Fix chalk bug: use own RGB function => get rid of chalk
  - [ ] Fix menu bug: duplicate last line when ZEEK_MENU_ROW=1
    - Currently fixed with workaround: if ZEEK_MENU_ROW=1, then set it to 2
  - [ ] Fix command parser bug: some commands fail to parse, e.g. pipes and
        redirects
