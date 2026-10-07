---
name: windows-git-path
description: Path to the git executable in this environment
always_on: true
---
# Git Executable Path
The `git` command is not available in the default PATH. To run git commands, you MUST use the full path:
`& "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"`
