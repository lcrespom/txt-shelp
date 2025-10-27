# ToDo

- History
  - [x] Gather selection
  - [x] Remove duplicates
  - [x] Create shell script to register keyboard shortcuts and buffer
        replacement
  - [ ] Underline builtins
  - [ ] Use which when possible (check performance)
  - Filter history
    - [x] Interactive line editor to filter
    - [x] Fix bug: empty item list
    - [ ] Place line editor at the bottom of the menu
    - [ ] Full keyboard support in interactive line editor (left, right, home,
          end, delete...)
    - [x] Gather initial buffer and use for initial filter
    - [ ] Fuzzy filter, shelp style
  - Colors
    - [x] Shell parser
    - [x] Syntax highlight lines
    - [ ] Show syntax highlight in selection, just change background
    - [ ] Highlight matched text
    - [ ] Make palette configurable
    - [ ] memoize highlighted lines => just memoize which, when implemented
- Dir History
  - [x] Create shell script part to add dirs to ~/.dir_history
  - [x] Implement menu
  - [x] `cd` to selection
- Misc
  - [x] Capture all exceptions and show cursor before exiting
  - [x] Use alternate screen buffer
  - [ ] Other navigation shortcuts
  - [ ] Read configuration from config file
