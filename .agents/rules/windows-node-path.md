---
name: windows-node-path
description: Ścieżka do Node.js i npx w PowerShell
always_on: true
---
# Node.js Path
Komendy `npm` i `npx` mogą nie być dostępne w domyślnym `$env:PATH`. Przed uruchomieniem skryptów Node (np. migracji, budowania, npx) dodaj ścieżkę do Node.js używając:
`$env:PATH += ";C:\Program Files\nodejs";` na początku komendy (np. `$env:PATH += ";C:\Program Files\nodejs"; npx tsx ...`).
