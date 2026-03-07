@echo off
cd /d "%~dp0"
title VK Spine Stok - GitHub'dan Guncelle
color 0B

echo ===================================================
echo   VK SPINE STOK UYGULAMASI GITHUB GUNCELLEME MODU
echo ===================================================
echo Bu islem kodlari otomatik olarak en son surume gunceller.
echo Lutfen bekleyin...
echo ===================================================

echo.
echo 0. Calisiyorsa uygulama kapatiliyor...
taskkill /f /im node.exe >nul 2>&1
echo [BILGI] Uygulama kapatildi (veya zaten kapali idi).

echo.
echo 1. GitHub baglantisi kontrol ediliyor...
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo [BILGI] Bu klasor henuz bir Git deposu degil.
    echo GitHub'dan son surumu indiriliyor...
    git init
    git remote add origin https://github.com/MuratMEC/VKSPINE.git
    git fetch origin main
    git checkout -f origin/main
) else (
    echo [BILGI] Mevcut Git deposu bulundu, guncelleniyor...
    git pull origin main
)

echo.
echo 2. Eger yeni paketler (kutuphaneler) varsa kuruluyor...
call npm install

echo.
echo 3. Veritabani guncelleniyor...
call npx prisma generate
call npx prisma db push

echo.
echo ===================================================
echo GITHUB GUNCELLEME ISLEMI TAMAMLANDI.
echo Simdi "2_Baslat.bat" dosyasini acabilirsiniz.
echo ===================================================
pause
