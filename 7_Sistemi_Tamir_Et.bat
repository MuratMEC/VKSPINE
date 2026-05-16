@echo off
:: Klasör yolunu sabitle
cd /d "%~dp0"

echo ==========================================
echo   MediStock Sistem Tamir ve Guncelleme
echo ==========================================
echo.
echo 1. Arka plan islemleri durduruluyor...
taskkill /F /IM node.exe /T 2>nul
net stop MediStockService 2>nul

echo.
echo 2. Veritabani istemcisi yenileniyor (Prisma Generate)...
:: Direkt prisma klasorunu kontrol ederek calistir
if exist "prisma\schema.prisma" (
    call npx prisma generate --schema=prisma/schema.prisma
) else (
    echo HATA: prisma/schema.prisma bulunamadi! 
    echo Lutfen bu dosyayi proje ana klasorunde calistirdiginizdan emin olun.
)

echo.
echo 3. Islem tamamlandi! 
echo Simdi sistemi '2_Baslat.bat' ile tekrar acabilirsiniz.
echo.
pause
