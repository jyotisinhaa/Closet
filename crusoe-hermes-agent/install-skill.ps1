# Install the closet-stylist skill into the Hermes skills directory.
$ErrorActionPreference = "Stop"

if (-not $env:HERMES_HOME) { $env:HERMES_HOME = "$env:LOCALAPPDATA\hermes" }
$dest = Join-Path $env:HERMES_HOME "skills\closet\closet-stylist"

New-Item -ItemType Directory -Force -Path (Join-Path $dest "scripts") | Out-Null
Copy-Item (Join-Path $PSScriptRoot "skills\closet-stylist\SKILL.md") $dest -Force
Copy-Item (Join-Path $PSScriptRoot "skills\closet-stylist\scripts\closet.py") (Join-Path $dest "scripts") -Force

Write-Host "Installed closet-stylist skill -> $dest" -ForegroundColor Green
Write-Host "Start a new 'hermes' session (skills load at startup) or run .\run-demo.ps1"
