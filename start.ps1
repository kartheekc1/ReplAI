# Backward-compat shim. Forwards to the real script in scripts/.
# Run any of these from the repo root:
#   .\start.ps1              -> scripts/start.ps1            (dev with hot reload)
#   .\start.ps1 prod         -> scripts/start-prod.ps1       (production build, fast nav)
#   .\start.ps1 ngrok        -> scripts/start-ngrok.ps1      (HTTPS tunnel for OAuth testing)
#
# Or run them directly:  .\scripts\start.ps1

param([string]$Mode = "dev")

$dir = Join-Path $PSScriptRoot "scripts"
switch ($Mode.ToLower()) {
  "prod"    { & "$dir\start-prod.ps1"  ; break }
  "ngrok"   { & "$dir\start-ngrok.ps1" ; break }
  default   { & "$dir\start.ps1"       ; break }
}
