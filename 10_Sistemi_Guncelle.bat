@echo off
title MediStock Sistem Guncelleyici
echo ==========================================
echo    MediStock ERP Guncelleme Sihirbazi
echo ==========================================
echo.
echo 1. Veritabanı yedekleniyor (dev.db.bak)...
copy prisma\dev.db prisma\dev.db.bak
echo.
echo 2. Yeni kodlar GitHub'dan indiriliyor...
git pull
echo.
echo 3. Yeni kutuphaneler kontrol ediliyor...
call npm install
echo.
echo 4. Veritabanı yapisi yeni versiyona uyarlaniyor...
echo (Verileriniz korunacaktir)
call npx prisma db push
echo.
echo 5. Sistem hazirlaniyor...
call npx prisma generate
echo.
echo ==========================================
echo   GUNCELLEME BASARIYLA TAMAMLANDI!
echo ==========================================
echo Simdi sistemi her zamanki gibi baslatabilirsiniz.
echo.
pause
