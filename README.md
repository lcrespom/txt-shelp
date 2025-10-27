# ToDo

- History
  - [x] Gather selection
  - [x] Remove duplicates
  - [ ] Create shell script to register keyboard shortcuts and buffer
        replacement
  - [ ] Read history file from any shell, not just zsh
  - [ ] Underline builtins
  - [ ] Use which when possible (check performance)
  - Filter history
    - [x] Interactive line editor to filter
    - [ ] Place line editor at the bottom of the menu
    - [ ] Full keyboard support in interactive line editor (left, right, home,
          end, delete...)
    - [ ] Gather initial buffer and use for initial filter
    - [ ] Fuzzy filter, shelp style
    - [x] Fix bug: empty item list
  - Colors
    - [x] Shell parser
    - [x] Syntax highlight lines
    - [ ] Show syntax highlight in selection, just change background
    - [ ] Highlight matched text
    - [ ] Make palette configurable
    - [ ] memoize highlighted lines => just memoize which, when implemented
- Dir History
  - [ ] Create shell script part to add dirs to ~/.dirHistory
  - [ ] Implement menu
  - [ ] `cd` to selection
  - [ ] Filter etc
- Misc
  - [x] Capture all exceptions and show cursor before exiting
  - [x] Use alternate screen buffer
  - [ ] Other navigation shortcuts
  - [ ] Read configuration from config file
