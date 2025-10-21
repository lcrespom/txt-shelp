export function parse_cmd(str: string): string[] {
  let result: string[] = []
  let log_matches = false
  let regex = /([$\w-/_~\.]+)|(".*?")|('.*?')/g
  let groups = [1, 2, 3]
  let match: RegExpExecArray | null

  while ((match = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++
    }
    // For this to work the regex groups need to be mutually exclusive
    groups.forEach(function (group) {
      if (match && match[group]) {
        result.push(match[group])
      }
    })
    // show matches for debugging
    log_matches &&
      match.forEach(function (m, group) {
        if (m) {
          console.log(`Match '${m}' found in group: ${group}`)
        }
      })
  }

  return result
}
