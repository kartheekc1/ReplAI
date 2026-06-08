# ReplAI launcher with ngrok HTTPS tunnel
# Usage:  .\start-ngrok.ps1
#
# What it does:
#   1. Verifies ngrok is installed and authenticated
#   2. Starts ngrok tunneling localhost:3000
#   3. Reads the public HTTPS URL from ngrok's local API
#   4. Auto-updates frontend/.env.local and backend/.env with that URL
#   5. Prints what to paste into the Meta dashboard
#   6. Starts both services

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "=== ReplAI launcher with ngrok ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check ngrok installation
if (-not (Get-Command "ngrok" -ErrorAction SilentlyContinue)) {
  Write-Host "[x] ngrok is not installed." -ForegroundColor Red
  Write-Host ""
  Write-Host "    Install it with:" -ForegroundColor Yellow
  Write-Host "      winget install Ngrok.Ngrok" -ForegroundColor White
  Write-Host ""
  Write-Host "    Then sign up free + grab your authtoken:" -ForegroundColor Yellow
  Write-Host "      https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
  Write-Host ""
  Write-Host "    Then register it locally:" -ForegroundColor Yellow
  Write-Host "      ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor White
  Write-Host ""
  Write-Host "    Then re-run this script." -ForegroundColor Yellow
  exit 1
}

# 2. Check authtoken
$cfgPath = Join-Path $env:LOCALAPPDATA "ngrok\ngrok.yml"
if (-not (Test-Path $cfgPath)) {
  $cfgPath = Join-Path $env:USERPROFILE ".ngrok2\ngrok.yml"
}
if ((Test-Path $cfgPath) -and -not (Select-String -Path $cfgPath -Pattern "authtoken:" -Quiet)) {
  Write-Host "[x] ngrok authtoken is not configured." -ForegroundColor Red
  Write-Host "    Run:  ngrok config add-authtoken YOUR_TOKEN_FROM_DASHBOARD" -ForegroundColor Yellow
  exit 1
}

# 3. Kill any previous ngrok session
Get-Process -Name ngrok -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 4. Start ngrok in the background, tunneling to Next.js (port 3000)
Write-Host "-> Starting ngrok tunnel to localhost:3000..." -ForegroundColor Green
$ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", "3000", "--log=stdout" `
  -WindowStyle Minimized -PassThru

# 5. Poll ngrok's local API for the public URL
Write-Host "   Waiting for ngrok to come up..." -ForegroundColor DarkGray
$publicUrl = $null
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Milliseconds 500
  try {
    $resp = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $tunnel = $resp.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
    if ($tunnel) {
      $publicUrl = $tunnel.public_url
      break
    }
  } catch {
    # ngrok still starting, retry
  }
}

if (-not $publicUrl) {
  Write-Host "[x] ngrok did not come up. Try running 'ngrok http 3000' manually to see the error." -ForegroundColor Red
  if ($ngrokProcess) { Stop-Process -Id $ngrokProcess.Id -Force -ErrorAction SilentlyContinue }
  exit 1
}

Write-Host "   ngrok public URL: $publicUrl" -ForegroundColor Cyan
Write-Host ""

# 6. Update env files
$callbackUrl = "$publicUrl/dashboard/accounts/callback"

Write-Host "-> Updating env files with ngrok URL..." -ForegroundColor Green
$frontendEnv = Join-Path $root "frontend\.env.local"
$backendEnv  = Join-Path $root "backend\.env"

function Set-EnvLine($path, $key, $value) {
  $text = Get-Content $path -Raw
  $pattern = "(?m)^${key}=.*$"
  if ($text -match $pattern) {
    $text = $text -replace $pattern, "$key=$value"
  } else {
    $text += "`n$key=$value"
  }
  $text | Set-Content $path -NoNewline
}

Set-EnvLine $frontendEnv "NEXT_PUBLIC_APP_URL"           $publicUrl
Set-EnvLine $frontendEnv "NEXT_PUBLIC_META_REDIRECT_URI" $callbackUrl
Set-EnvLine $backendEnv  "META_REDIRECT_URI"             $callbackUrl
Set-EnvLine $backendEnv  "FRONTEND_URL"                  $publicUrl
$publicHost = ([uri]$publicUrl).Host
Set-EnvLine $backendEnv  "ALLOWED_ORIGINS"               "$publicUrl,http://localhost:3000"

Write-Host "   frontend\.env.local + backend\.env updated" -ForegroundColor DarkGray
Write-Host ""

# 7. Print Meta dashboard instructions
Write-Host "===================================================================" -ForegroundColor Magenta
Write-Host " IMPORTANT - paste this in Meta dashboard NOW (before clicking Connect):" -ForegroundColor Magenta
Write-Host "===================================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  https://developers.facebook.com/apps/977244885163188/instagram-business/API-Setup/" -ForegroundColor White
Write-Host ""
Write-Host "  Click 'Business login settings' and replace ALL three fields with:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  OAuth Redirect URIs       : $callbackUrl" -ForegroundColor Cyan
Write-Host "  Deauthorize callback URL  : $publicUrl/api/instagram/deauth" -ForegroundColor Cyan
Write-Host "  Data deletion request URL : $publicUrl/api/instagram/data-deletion" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Then click Save." -ForegroundColor Yellow
Write-Host ""
Write-Host "===================================================================" -ForegroundColor Magenta

# Auto-open the Meta dashboard
Start-Process "https://developers.facebook.com/apps/977244885163188/instagram-business/API-Setup/"

Write-Host ""
Read-Host "Press ENTER once you've saved the URLs in Meta dashboard"

# 8. Validate backend env secrets
Write-Host ""
Write-Host "-> Validating backend\.env" -ForegroundColor Green
$envText = Get-Content $backendEnv -Raw
$bad = @()
if ($envText -match "SUPABASE_JWT_SECRET=PASTE_JWT_SECRET_HERE")            { $bad += "SUPABASE_JWT_SECRET" }
if ($envText -match "SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE") { $bad += "SUPABASE_SERVICE_ROLE_KEY" }
if ($bad.Count -gt 0) {
  Write-Host "[x] These secrets are still placeholders:" -ForegroundColor Red
  $bad | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
  Write-Host "    Fill them from https://supabase.com/dashboard/project/sbmeckxvilnuawkhuumk/settings/api" -ForegroundColor Yellow
  Start-Process "https://supabase.com/dashboard/project/sbmeckxvilnuawkhuumk/settings/api"
  Start-Process "notepad.exe" $backendEnv
  Write-Host "    Save the file then press ENTER to continue." -ForegroundColor Yellow
  Read-Host
}

# 9. Start backend + frontend in their own windows
$backend  = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

if (-not (Test-Path "$backend\.venv\Scripts\uvicorn.exe")) {
  Write-Host "[x] backend\.venv missing - run .\start.ps1 once first to install deps." -ForegroundColor Red
  exit 1
}
if (-not (Test-Path "$frontend\node_modules\.bin\next.cmd")) {
  Write-Host "[x] frontend\node_modules missing - run .\start.ps1 once first to install deps." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "-> Launching backend + frontend..." -ForegroundColor Green
$backendCmd  = "cd '$backend'; & '$backend\.venv\Scripts\Activate.ps1'; Write-Host 'ReplAI API on http://localhost:8000' -ForegroundColor Cyan; uvicorn app.main:app --reload"
$frontendCmd = "cd '$frontend'; Write-Host 'ReplAI Web on http://localhost:3000 (public via $publicUrl)' -ForegroundColor Cyan; npm run dev"

Start-Process powershell -ArgumentList "-NoExit","-Command",$backendCmd
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit","-Command",$frontendCmd
Start-Sleep -Seconds 5

# 10. Open the public URL in the browser
Start-Process $publicUrl

Write-Host ""
Write-Host "[ok] Everything started." -ForegroundColor Green
Write-Host "     Public site -> $publicUrl" -ForegroundColor White
Write-Host "     Backend     -> http://localhost:8000/docs" -ForegroundColor White
Write-Host "     ngrok dash  -> http://localhost:4040" -ForegroundColor White
Write-Host ""
Write-Host "DO NOT close this ngrok process - the URL stops working if you do." -ForegroundColor Yellow
Write-Host "Press Ctrl+C in this window to shut everything down." -ForegroundColor DarkGray
Write-Host ""

# Wait so ngrok stays alive
Wait-Process -Id $ngrokProcess.Id
