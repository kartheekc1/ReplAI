# ReplyVerse - one-command launcher (Windows / PowerShell)
# Usage:  .\start.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "=== ReplyVerse launcher ===" -ForegroundColor Cyan
Write-Host "root: $root" -ForegroundColor DarkGray
Write-Host ""

# 1. Sanity checks
function Need($cmd, $hint) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "[x] '$cmd' is not installed." -ForegroundColor Red
    Write-Host "    $hint" -ForegroundColor Yellow
    exit 1
  }
}
Need node    "Install Node 20+ from https://nodejs.org"
Need npm     "Install Node 20+ from https://nodejs.org"

# Locate a Python interpreter. Prefers 3.12 / 3.13 / 3.11 (stable, prebuilt wheels)
# over 3.14 (too new — many packages still compile from source on it).
function Find-Python {
  # First try `py` launcher with specific stable versions
  if (Get-Command "py" -ErrorAction SilentlyContinue) {
    foreach ($v in @("-3.12", "-3.13", "-3.11")) {
      $check = & py $v --version 2>$null
      if ($LASTEXITCODE -eq 0) {
        return @{ Cmd = "py"; Args = @($v); Label = "py $v ($check)" }
      }
    }
  }
  # Then try bare `python` if it's a stable version
  $py = Get-Command "python" -ErrorAction SilentlyContinue
  if ($py) {
    $ver = & python --version 2>&1
    if ($ver -notmatch "3\.14") {
      return @{ Cmd = $py.Source; Args = @(); Label = $ver }
    }
  }
  # Last resort: `py` default (may be 3.14)
  if (Get-Command "py" -ErrorAction SilentlyContinue) {
    $ver = & py --version 2>&1
    Write-Host "    WARNING: using default '$ver' - wheels may need to compile from source" -ForegroundColor Yellow
    return @{ Cmd = "py"; Args = @(); Label = $ver }
  }
  return $null
}
$pyInfo = Find-Python
if (-not $pyInfo) {
  Write-Host "[x] No Python interpreter found." -ForegroundColor Red
  Write-Host "    Install Python 3.12 with:  winget install Python.Python.3.12" -ForegroundColor Yellow
  exit 1
}
Write-Host "    using Python: $($pyInfo.Label)" -ForegroundColor DarkGray

# 2. Backend setup
Write-Host "-> Backend (FastAPI)" -ForegroundColor Green
$backend = Join-Path $root "backend"

if (-not (Test-Path "$backend\.env")) {
  Copy-Item "$backend\.env.example" "$backend\.env"
  Write-Host "   wrote backend\.env from template" -ForegroundColor DarkGray
}

if (-not (Test-Path "$backend\.venv")) {
  Write-Host "   creating virtualenv..." -ForegroundColor DarkGray
  & $pyInfo.Cmd @($pyInfo.Args) -m venv "$backend\.venv"
  if (-not (Test-Path "$backend\.venv\Scripts\python.exe")) {
    Write-Host "[x] venv creation failed." -ForegroundColor Red
    exit 1
  }
}

$py = Join-Path $backend ".venv\Scripts\python.exe"
$uvicornExe = Join-Path $backend ".venv\Scripts\uvicorn.exe"

Write-Host "   installing Python dependencies (visible output)..." -ForegroundColor DarkGray
& $py -m pip install --upgrade pip
& $py -m pip install -r "$backend\requirements.txt"

if (-not (Test-Path $uvicornExe)) {
  Write-Host ""
  Write-Host "[x] uvicorn was not installed - pip must have failed above." -ForegroundColor Red
  Write-Host "    Scroll up to see the real error. Common fixes:" -ForegroundColor Yellow
  Write-Host "      - if you see a dependency conflict, delete .venv and re-run:" -ForegroundColor Yellow
  Write-Host "          Remove-Item -Recurse -Force '$backend\.venv'" -ForegroundColor Yellow
  Write-Host "          .\start.ps1" -ForegroundColor Yellow
  Write-Host "      - if a package wheel is missing for Python 3.14, install Python 3.12:" -ForegroundColor Yellow
  Write-Host "          winget install Python.Python.3.12 ; then delete .venv and re-run" -ForegroundColor Yellow
  exit 1
}

# 3. Frontend setup
Write-Host "-> Frontend (Next.js)" -ForegroundColor Green
$frontend = Join-Path $root "frontend"
$nextBin  = Join-Path $frontend "node_modules\.bin\next.cmd"

if (-not (Test-Path "$frontend\.env.local")) {
  Copy-Item "$frontend\.env.example" "$frontend\.env.local"
  Write-Host "   wrote frontend\.env.local from template" -ForegroundColor DarkGray
}

# Always run npm install if `next` isn't present (catches partial installs)
if (-not (Test-Path $nextBin)) {
  Write-Host "   installing npm dependencies (visible output, can take a minute)..." -ForegroundColor DarkGray
  Push-Location $frontend
  # React 19 + Next 15 sometimes needs --legacy-peer-deps for older transitive packages
  npm install --legacy-peer-deps
  if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host ""
    Write-Host "[x] npm install failed. Scroll up to see the real error." -ForegroundColor Red
    exit 1
  }
  Pop-Location
}

if (-not (Test-Path $nextBin)) {
  Write-Host "[x] 'next' binary still missing after npm install at:" -ForegroundColor Red
  Write-Host "    $nextBin" -ForegroundColor Yellow
  exit 1
}

# 4. Launch both services
Write-Host ""
Write-Host "-> Launching services in two new windows..." -ForegroundColor Green
Write-Host ""

$backendCmd  = "cd '$backend'; & '$backend\.venv\Scripts\Activate.ps1'; Write-Host 'ReplyVerse API on http://localhost:8000  (Ctrl+C to stop)' -ForegroundColor Cyan; uvicorn app.main:app --reload"
$frontendCmd = "cd '$frontend'; Write-Host 'ReplyVerse Web on http://localhost:3000  (Ctrl+C to stop)' -ForegroundColor Cyan; npm run dev"

Start-Process powershell -ArgumentList "-NoExit","-Command",$backendCmd
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit","-Command",$frontendCmd

Start-Sleep -Seconds 6
Start-Process "http://localhost:3000"

Write-Host "[ok] Both services starting." -ForegroundColor Green
Write-Host "     Frontend  -> http://localhost:3000"
Write-Host "     Backend   -> http://localhost:8000/docs"
Write-Host ""
Write-Host "Close either window to stop that service." -ForegroundColor DarkGray
Write-Host ""
