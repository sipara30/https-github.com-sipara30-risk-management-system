@echo off
echo ========================================
echo Government Risk Management System Setup
echo ========================================
echo.
echo This script will create the admin user in your database
echo Admin Login: admin@admin.com
echo Admin Password: 12345678
echo.
echo Make sure your MySQL server is running and accessible
echo.
pause

echo.
echo Running database setup...
echo.

REM Run the main database setup first
mysql -u root -p < setup_database.sql

echo.
echo Creating admin user...
echo.

REM Create the admin user
mysql -u root -p < create_admin_user.sql

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Admin user created successfully:
echo - Email: admin@admin.com
echo - Password: 12345678
echo - Role: Administrator
echo.
echo You can now login to the system
echo.
pause

