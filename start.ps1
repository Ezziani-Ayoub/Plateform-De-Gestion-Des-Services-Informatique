# Script PowerShell pour lancer le Backend et le Frontend simultanément

$root = $PSScriptRoot

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Lancement de PGSI (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Lancement du Backend Spring Boot (Java 21)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; `$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot'; mvn spring-boot:run"

Write-Host "2. Lancement du Frontend React (Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "✔ Les deux serveurs sont en cours de lancement dans deux fenêtres distinctes !" -ForegroundColor Green
Write-Host "• Backend  : http://localhost:8080" -ForegroundColor Gray
Write-Host "• Frontend : http://localhost:3000" -ForegroundColor Gray
Write-Host "===================================================" -ForegroundColor Cyan
