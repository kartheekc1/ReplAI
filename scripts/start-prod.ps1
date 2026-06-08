# ReplAI - production-mode launcher
# Usage:  .\start-prod.ps1
#
# Why use this:
#   `next dev` recompiles every route on first visit -> 5-20s wait per page.
#   `next build` does all the work UP FRONT once, then `next start` serves
#   pre-compiled, minified, code-split pages -> navigation feels instant (<1s).
#
# Trade-off:
#   You lose hot-reload. If you edit code, re-run this script to rebuild.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "=== ReplAI launcher (PRODUCTION mode) ===" -ForegroundColor Cyan
Write-Host "    Routes compile once, serve fast. No hot-reload." -ForegroundColor DarkGray
Write-Host ""

$backend  = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

# 1. Validate backend env
$envText = Get-Content "$backend\.env" -Raw
$bad = @()
if ($envText -match "SUPABASE_JWT_SECRET=PASTE_JWT_SECRET_HERE")            { $bad += "SUPABASE_JWT_SECRET" }
if ($envText -match "SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE") { $bad += "SUPABASE_SERVICE_ROLE_KEY" }
if ($bad.Count -gt 0) {
  Write-Host "[x] backend\.env still has placeholder secrets:" -ForegroundColor Red
  $bad | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
  Write-Host "    Fill them from https://supabase.com/dashboard/project/sbmeckxvilnuawkhuumk/settings/api" -ForegroundColor Yellow
  exit 1
}

# 2. Verify deps are installed
if (-not (Test-Path "$backend\.venv\Scripts\uvicorn.exe")) {
  Write-Host "[x] backend\.venv missing. Run .\start.ps1 once to install dependencies." -ForegroundColor Red
  exit 1
}
if (-not (Test-Path "$frontend\node_modules\.bin\next.cmd")) {
  Write-Host "[x] frontend\node_modules missing. Run .\start.ps1 once to install dependencies." -ForegroundColor Red
  exit 1
}

# 3. Build frontend (this is where Next.js does all the heavy lifting)
Write-Host "-> Building frontend (one-time, ~30-90s)..." -ForegroundColor Green
Push-Location $frontend
$env:NEXT_TELEMETRY_DISABLED = "1"
npm run build
if ($LASTEXITCODE -ne 0) {
  Pop-Location
  Write-Host "[x] Build failed - see error above." -ForegroundColor Red
  exit 1
}
Pop-Location
Write-Host "   Build complete." -ForegroundColor DarkGray

# 4. Spawn backend + frontend in production windows
Write-Host ""
Write-Host "-> Launching services..." -ForegroundColor Green

$backendCmd  = "cd '$backend'; & '$backend\.venv\Scripts\Activate.ps1'; Write-Host 'ReplAI API on http://localhost:8000  (production, no reload)' -ForegroundColor Cyan; uvicorn app.main:app --host 0.0.0.0 --port 8000"
$frontendCmd = "cd '$frontend'; Write-Host 'ReplAI Web on http://localhost:3000  (production build)' -ForegroundColor Cyan; npm run start"

Start-Process powershell -ArgumentList "-NoExit","-Command",$backendCmd
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit","-Command",$frontendCmd
Start-Sleep -Seconds 4

Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "[ok] Both services running in production mode." -ForegroundColor Green
Write-Host "     Frontend  -> http://localhost:3000   (instant navigation)" -ForegroundColor White
Write-Host "     Backend   -> http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "To rebuild after code changes: re-run this script." -ForegroundColor DarkGray
Write-Host "To go back to dev mode (hot reload, slow):  .\start.ps1" -ForegroundColor DarkGray
Write-Host ""
