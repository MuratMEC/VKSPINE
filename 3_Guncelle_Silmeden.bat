@echo off
cd /d "%~dp0"
title VK Spine Stok - Veri Kaybetmeden Guncelle
color 0E

echo ===================================================
echo   VK SPINE STOK UYGULAMASI GUNCELLEME MODU
echo ===================================================
echo Bu islem onceden girilen verilerinizi SILMEDEN
echo sadece yazilimi ve veritabani yapisini gunceller.
echo.
echo Lutfen bekleyin...
echo ===================================================

echo.
echo [1/3] Paketler kontrol ediliyor...
call npm install

echo.
echo [2/3] Veritabani yapisi guncelleniyor...
git rm --cached dev.db prisma/prisma/dev.db prisma/dev.db 2>nul
call npx prisma generate
call npx prisma db push --accept-data-loss

echo.
echo [3/3] Onbellek temizleniyor ve yeniden derleniyor...
if exist .next rmdir /s /q .next
call npm run build

echo.
echo ===================================================
echo GUNCELLEME ISLEMI TAMAMLANDI.
echo Simdi "2_Baslat.bat" ile sistemi acabilirsiniz.
echo ===================================================
pause
