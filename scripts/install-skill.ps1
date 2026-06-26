param(
  [string]$SkillRoot = "$HOME\.agents\skills"
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$Source = Join-Path $RepoRoot ".agents\skills\local-postgres-notes"
$TargetRoot = [System.IO.Path]::GetFullPath($SkillRoot)
$Target = Join-Path $TargetRoot "local-postgres-notes"

if (-not (Test-Path -LiteralPath $Source)) {
  throw "Skill source not found: $Source"
}

New-Item -ItemType Directory -Force -Path $Target | Out-Null
Copy-Item -LiteralPath (Join-Path $Source "SKILL.md") -Destination (Join-Path $Target "SKILL.md") -Force

$SkillFile = Join-Path $Target "SKILL.md"
$EscapedRepoRoot = $RepoRoot.Replace("'", "''")
$Content = [System.IO.File]::ReadAllText($SkillFile)
$Content = $Content.Replace("__LOCAL_DB_REPO_PATH__", $EscapedRepoRoot)
[System.IO.File]::WriteAllText($SkillFile, $Content, [System.Text.UTF8Encoding]::new($false))

Write-Host "Installed local-postgres-notes skill to $Target"
Write-Host "Restart your agent app if it does not pick up new skills automatically."
