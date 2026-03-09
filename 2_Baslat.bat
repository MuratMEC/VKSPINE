@echo off
cd /d "%~dp0"
title VK Spine Stok - Calisiyor
color 0A

echo ===================================================
echo   VK SPINE STOK UYGULAMASI BASLATILIYOR...
echo ===================================================
echo.
echo Tarayiciniz birazdan otomatik acilacak.
echo Adres: http://localhost:3000
echo.
echo Lutfen bu pencereyi KAPATMAYIN.
echo ===================================================

start http://localhost:3000
npm run dev

pause
