# ToDo

- History
  - [x] Gather selection
  - [x] Remove duplicates
  - [x] Create shell script to register keyboard shortcuts and buffer
        replacement
  - [ ] Underline builtins
  - [ ] Use which when possible (check performance)
  - [ ] Place menu at bottom (negative row config)
  - Filter history
    - [x] Interactive line editor to filter
    - [x] Fix bug: empty item list
    - [x] Full keyboard support in interactive line editor (left, right, home,
          end, delete...)
    - [x] Gather initial buffer and use for initial filter
    - [x] Fuzzy filter, shelp style
    - [ ] Fix command parser bug: some commands fail to parse
    - [ ] Place line editor at the bottom of the menu
  - Colors
    - [x] Shell parser
    - [x] Syntax highlight lines
    - [x] Show syntax highlight in selection, just change background
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
