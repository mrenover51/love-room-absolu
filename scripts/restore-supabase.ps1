param([Parameter(Mandatory = $true)][string]$DatabaseUrl,[Parameter(Mandatory = $true)][string]$BackupFile,[switch]$ConfirmRestore)
$ErrorActionPreference = "Stop"
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$backupRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "backups"))
$resolvedFile = [System.IO.Path]::GetFullPath($BackupFile)
if (-not $resolvedFile.StartsWith($backupRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "La sauvegarde doit provenir du dossier backups du projet." }
if (-not (Test-Path -LiteralPath $resolvedFile -PathType Leaf)) { throw "Fichier de sauvegarde introuvable." }
if (-not $ConfirmRestore) { throw "Restauration annulée. Relancez avec -ConfirmRestore après vérification de la cible isolée." }
pg_restore --clean --if-exists --no-owner --no-acl --exit-on-error --dbname=$DatabaseUrl $resolvedFile
if ($LASTEXITCODE -ne 0) { throw "La restauration a échoué." }
Write-Output "Restauration terminée. Exécutez npm run verify et la recette fonctionnelle."
