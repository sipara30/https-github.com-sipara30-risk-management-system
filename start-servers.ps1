Write-Host "Starting Risk Management System..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend Server (Prisma)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run server:prisma" -WindowStyle Normal

Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run preview" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers should now be running:" -ForegroundColor Green
Write-Host "- Backend: http://localhost:3001" -ForegroundColor White
Write-Host "- Frontend: http://localhost:4173" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
