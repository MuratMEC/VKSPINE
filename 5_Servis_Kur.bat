@echo off
setlocal
cd /d "%~dp0"
title VK SPINE STOK - SERVIS KURUCU

echo ===================================================
echo   VK SPINE STOK - WINDOWS SERVISI KURULUYOR
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
echo [1/3] Gerekli kutuphane (node-windows) kuruluyor...
call npm install node-windows --save-dev

echo.
echo [2/3] Proje derleniyor (build)...
call npm run build

echo.
echo [3/3] Servis kaydediliyor ve baslatiliyor...
node scripts\install_service.js

echo.
echo ===================================================
echo   ISLEM TAMAMLANDI!
echo ===================================================
echo Servis arka planda calismaya tesvik edildi.
echo Tarayicidan http://localhost:3000 adresine girebilirsiniz.
echo Bilgisayar her acildiginda otomatik calisacaktir.
echo.
pause
