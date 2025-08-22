# Government Risk Management System Setup
# This script will create the admin user in your database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Government Risk Management System Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will create the admin user in your database" -ForegroundColor Yellow
Write-Host "Admin Login: admin@admin.com" -ForegroundColor Green
Write-Host "Admin Password: 12345678" -ForegroundColor Green
Write-Host ""
Write-Host "Make sure your MySQL server is running and accessible" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Press Enter to continue or 'N' to cancel"
if ($confirmation -eq 'N' -or $confirmation -eq 'n') {
    Write-Host "Setup cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Running database setup..." -ForegroundColor Yellow
Write-Host ""

try {
    # Run the main database setup first
    Write-Host "Setting up main database..." -ForegroundColor Green
    mysql -u root -p < setup_database.sql
    
    Write-Host ""
    Write-Host "Creating admin user..." -ForegroundColor Green
    Write-Host ""
    
    # Create the admin user
    mysql -u root -p < create_admin_user.sql
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Admin user created successfully:" -ForegroundColor Green
    Write-Host "- Email: admin@admin.com" -ForegroundColor White
    Write-Host "- Password: 12345678" -ForegroundColor White
    Write-Host "- Role: Administrator" -ForegroundColor White
    Write-Host ""
    Write-Host "You can now login to the system" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "Error during setup: $_" -ForegroundColor Red
    Write-Host "Please check your MySQL connection and try again." -ForegroundColor Yellow
}

Read-Host "Press Enter to exit"

