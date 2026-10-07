---
name: windows-powershell-regex
description: Strict constraints for editing files in PowerShell
always_on: true
---
# Windows PowerShell Regex Constraints
When operating in this Windows PowerShell environment, NEVER use `Get-Content -replace` to modify complex files (like TypeScript, TSX, JSON, or code with newlines and backticks). It causes silent corruption by incorrectly parsing escape characters like \`n\`.
Always rely on the `replace_file_content` or `write_to_file` tools.
