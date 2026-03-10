@echo off
setlocal
cd /d "%~dp0"
title VK SPINE STOK - SERVIS KALDIRICI

echo ===================================================
echo   VK SPINE STOK - WINDOWS SERVISI KALDIRILIYOR
echo ===================================================
echo.
echo NOT: Bu islemi Yonetici (Administrator) olarak 
echo calistirdiginizdan emin olun.
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Yonetici haklari dogrulandi.
) else (
    echo [HATA] Lutfen bu dosyayi sag tiklayip 'YONETICI OLARAK CALISTIR' secenegini secin.
    pause
    exit /b 1
)

echo.
echo [1/1] Servis durduruluyor ve siliniyor...
node scripts\uninstall_service.js

echo.
echo ===================================================
echo   ISLEM TAMAMLANDI!
echo ===================================================
echo Servis sistemden kaldirildi.
echo.
pause
