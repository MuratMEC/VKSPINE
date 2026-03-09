@echo off
cd /d "%~dp0"
title VK Spine Stok - GitHub'dan Guncelle
color 0B

echo ===================================================
echo   VK SPINE STOK UYGULAMASI GITHUB GUNCELLEME MODU
echo ===================================================
echo.

:: 0. Calisiyorsa uygulama kapatiliyor
echo [1/4] Uygulama kapatiliyor...
taskkill /f /im node.exe >nul 2>&1
echo [BILGI] Uygulama durduruldu.

:: 1. GitHub baglantisi kontrol ediliyor
echo.
echo [2/4] GitHub baglantisi kontrol ediliyor...
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo [BILGI] Klasor henuz bir Git deposu degil. Ayarlaniyor...
    git init
    git remote add origin https://github.com/MuratMEC/VKSPINE.git
    git fetch origin main
    git reset --hard origin/main
) else (
    echo [BILGI] Mevcut Git deposu bulundu, guncelleniyor...
    git fetch origin main
    git reset --hard origin/main
)

:: 2. Bagimliliklar
echo.
echo [3/4] Yeni paketler kontrol ediliyor...
call npm install

:: 3. Veritabani
echo.
echo [4/4] Veritabani yapisi guncelleniyor...
call npx prisma generate
call npx prisma db push --accept-data-loss

echo.
echo ===================================================
echo GUNCELLEME ISLEMI TAMAMLANDI.
echo Artik "2_Baslat.bat" dosyasini kullanabilirsiniz.
echo ===================================================
pause
