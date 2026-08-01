param([Parameter(Mandatory = $true)][string]$DatabaseUrl)

$ErrorActionPreference = "Stop"
$backupDirectory = Join-Path $PSScriptRoot "..\backups"
$resolvedRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$resolvedBackup = [System.IO.Path]::GetFullPath($backupDirectory)
if (-not $resolvedBackup.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Le dossier de sauvegarde doit rester dans le projet."
}
New-Item -ItemType Directory -Path $resolvedBackup -Force | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $resolvedBackup "absolu-$timestamp.dump"
pg_dump --format=custom --no-owner --no-acl --dbname=$DatabaseUrl --file=$target
Write-Output "Sauvegarde créée : $target"
