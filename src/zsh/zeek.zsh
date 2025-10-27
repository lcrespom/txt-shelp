# ------------------------- Configuration -------------------------
# Zeek menu size, in width x height chars.
ZEEK_MENU_SIZE="80x40"
# Zeek menu position. Positive numbers refer to the top left corner, negative numbers to the bottom right.
ZEEK_MENU_POS="3 1"

# Maximun number of history lines to get from zsh. Duplicates are removed, so the history popup will probably
# have fewer entries.
ZEEK_MAX_HISTORY_LINES=1000

alias zeek='node src/index.ts </dev/tty 3>&1 1>&2'
# ------------------------- Configuration end -------------------------

# Record every time the user changes directory
function chpwd() {
    zeek store-dir "$PWD"
}

# Open Zeek dir history popup
function dir_history_popup() {
    local new_dir=$(zeek dir-history)
    if [[ -n "$new_dir" ]]; then
        echo
        cd $new_dir
        zle reset-prompt
    fi
}

# Open Zeek command history popup
function history_popup() {
    local history_command=$(zeek history "$LBUFFER" "$RBUFFER")
    [[ -n "$history_command" ]] && LBUFFER="$history_command" && RBUFFER=""
}

# Open Zeek popup in the file search page
function file_search_popup() {
    local search_out=$(zeek file-search "$LBUFFER" "$PWD")
    [[ -n "$search_out" ]] && LBUFFER=$search_out
}

# Just move one directory up
function cd_to_parent_dir() {
    echo
    cd ..
    zle reset-prompt
}

# Clear the whole line
function clear_line() {
    LBUFFER=""
    RBUFFER=""
}

# Register the functions as widgets
zle -N dir_history_popup
zle -N history_popup
zle -N file_search_popup
zle -N cd_to_parent_dir
zle -N clear_line

# Key codes
KB_PAGE_UP="^[[5~"
KB_PAGE_DOWN="^[[6~"
KB_HOME="^[[H"
KB_SHIFT_UP="^[[1;2A"
KB_SHIFT_RIGHT="^[[1;2C"
KB_END="^[[F"
KB_TAB="^I"
KB_ESC="\e"
KB_OPTION_LEFT="^[^[[D"
KB_OPTION_RIGHT="^[^[[C"

# Bind the activation keys to the widgets
bindkey $KB_PAGE_DOWN dir_history_popup
bindkey $KB_PAGE_UP history_popup
bindkey $KB_SHIFT_RIGHT file_search_popup
bindkey $KB_SHIFT_UP cd_to_parent_dir
bindkey $KB_ESC clear_line

# Bind home, end, opt+left and opt+right keys for convenience
bindkey $KB_HOME beginning-of-line
bindkey $KB_END end-of-line
bindkey $KB_OPTION_LEFT backward-word
bindkey $KB_OPTION_RIGHT forward-word

# Disable default tab completion
# unsetopt complete_in_word

# Reduce key sequence timeout to only 100ms to make ESC key react faster
KEYTIMEOUT=10