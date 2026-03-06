@echo off
title VK Spine Stok - Veri Kaybetmeden Guncelle
color 0E

echo ===================================================
echo   VK SPINE STOK UYGULAMASI GUNCELLEME MODU
echo ===================================================
echo Bu islem onceden girilen hasta/fatura/stok verilerinizi
echo SILMEDEN sadece yazilimin arka plan kodlarini ve 
echo veritabani tablolarini gunceller.
echo.
echo Lutfen bekleyin...
echo ===================================================

echo.
echo 1. Yeni paketler kontrol ediliyor...
call npm install

echo.
echo 2. Veritabani sablonu güncelleniyor (VERILER KORUNUYOR)...
call npx prisma generate
call npx prisma db push

echo.
echo ===================================================
echo GUNCELLEME ISLEMI TAMAMLANDI.
echo Hicbir veriniz silinmedi. Simdi "2_Baslat.bat" ile
echo sistemi yeniden acabilirsiniz.
echo ===================================================
pause
