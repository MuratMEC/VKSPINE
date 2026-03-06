@echo off
title VK Spine Stok - Kurulum
color 0B

echo ===================================================
echo        VK SPINE STOK - ILK KURULUM SISTEMI
echo ===================================================
echo Lutfen bekleyin, gerekli paketler internetten indiriliyor...
echo.

call npm install

echo.
echo ===================================================
echo Veritabani tablolari olusturuluyor...
call npx prisma generate
call npx prisma db push --accept-data-loss

echo.
echo ===================================================
echo Ornek veriler ve yonetici ayarlari yukleniyor...
call npx prisma db seed

echo.
echo ===================================================
echo KURULUM BASARIYLA TAMAMLANDI!
echo Artik "2_Baslat.bat" dosyasina cift tiklayarak sistemi acabilirsiniz.
echo ===================================================
pause
