@echo off
title MediStock Sifir Kurulum Sihirbazi
echo ==========================================
echo    MediStock ERP Sifir Kurulum Araci
echo ==========================================
echo.

if not exist .env (
    echo [.env] dosyasi olusturuluyor...
    echo DATABASE_URL="file:./dev.db" > .env
    echo SECRET_COOKIE_PASSWORD="complex_password_at_least_32_characters_long_for_vk_spine_app" >> .env
)

echo.
echo 1. Kutuphaneler yukleniyor (Bu biraz vakit alabilir)...
call npm install

echo.
echo 2. Veritabanı tablolari olusturuluyor...
call npx prisma db push

echo.
echo 3. Sistem motoru hazirlaniyor...
call npx prisma generate

echo.
echo ==========================================
echo    KURULUM BASARIYLA TAMAMLANDI!
echo ==========================================
echo Simdi sistemi 'npm run dev' ile baslatabilirsiniz.
echo Giris yaptiktan sonra dashboard bos gelirse:
echo http://localhost:3000/api/demo/seed adresine gidin.
echo ==========================================
pause
