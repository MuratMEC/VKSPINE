@echo off
echo ==============================================
echo VK Spine Stok Takip - Kurulum Yoneticisi
echo ==============================================
echo.
echo Node.js kontrol ediliyor...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [HATA] Node.js yuklu degil! Lutfen once Node.js indirin: https://nodejs.org/
    pause
    exit /b
)
echo Node.js kurulu.
echo.

echo 1. Gerekli kutuphaneler yukleniyor (npm install)...
call npm install
echo.

echo 2. Veritabani hazirlaniyor (npx prisma db push)...
call npx prisma db push
echo.

echo 3. Prisma Mimarisi olusturuluyor (npx prisma generate)...
call npx prisma generate
echo.

echo 4. Proje Derleniyor (Production Build)...
call npm run build
echo.

echo Kurulum Tamamlandi! Sistemi baslatmak icin 'baslat.bat' dosyasini calistirin.
pause
