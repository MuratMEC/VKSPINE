@echo off
cd /d "%~dp0"
title VK Spine Stok - Manuel Kurulum
color 0B

echo ===================================================
echo        VK SPINE STOK - KURULUM SISTEMI
echo ===================================================
echo.

echo [1/3] Paketler yukleniyor...
call npm install

echo.
echo [2/3] Veritabani yapisi olusturuluyor...
call npx prisma generate
call npx prisma db push --accept-data-loss

echo.
echo [3/3] Varsayilan veriler yukleniyor...
call npx prisma db seed

echo.
echo ===================================================
echo KURULUM TAMAMLANDI!
echo Simdi "2_Baslat.bat" ile sistemi baslatabilirsiniz.
echo ===================================================
pause
