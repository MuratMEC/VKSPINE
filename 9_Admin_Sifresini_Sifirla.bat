@echo off
title MediStock Sifre Sifirlama
echo ==========================================
echo   MediStock Admin Sifre Sifirlayici
echo ==========================================
echo.
echo Bu islem 'admin' kullanicisinin sifresini 
echo 'admin123' olarak guncelleyecektir.
echo.
pause

node scripts/reset_admin.js

echo.
echo Islem tamamlandi.
pause
