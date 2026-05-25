# Run the Closet stylist agent (Hermes on Crusoe Nemotron) one-shot.
# Usage:  .\run-demo.ps1                 # default styling request
#         .\run-demo.ps1 "your prompt"   # custom request
$ErrorActionPreference = "Stop"

if (-not $env:HERMES_HOME)          { $env:HERMES_HOME = "$env:LOCALAPPDATA\hermes" }
if (-not $env:HERMES_GIT_BASH_PATH) { $env:HERMES_GIT_BASH_PATH = "C:\Program Files\Git\bin\bash.exe" }

$hermes = Join-Path $env:HERMES_HOME "hermes-agent\venv\Scripts\hermes.exe"
if (-not (Test-Path $hermes)) { throw "Hermes not found at $hermes. Install it first (see README)." }

$prompt = if ($args.Count -gt 0) {
    $args -join " "
} else {
    "Act as my personal stylist using the closet-stylist skill. Check my profile and wardrobe, " +
    "then suggest exactly 2 catalog items to buy that pair well with what I already own, " +
    "with a one-line reason for each. Do NOT run a try-on."
}

Write-Host "== Hermes + Crusoe Nemotron Nano Omni ==" -ForegroundColor Cyan
& $hermes -z $prompt --yolo -t terminal,skills
