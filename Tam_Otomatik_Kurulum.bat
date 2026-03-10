@echo off
:: Pencerenin hemen kapanmamasi icin baslangic kontrolu
echo [BILGI] Sistem baslatiliyor, lutfen bekleyin...

:: Karakter kodlamasini ayarla (Turkce karakterler icin)
chcp 65001 >nul

:: Dosyanin bulundugu dizine gec (Tirnak icinde kullanarak bosluklu yollari destekle)
cd /d "%~dp0"

title VK Spine Stok - Akilli Kurulum ve Baslatma
color 0B

echo.
echo ===================================================
echo     VK SPINE STOK - AKILLI KURULUM VE BASLATMA
echo ===================================================
echo [BILGI] Mevcut Klasor: %CD%
echo.

:: 1. Adim: Node.js Kontrolu
echo [1/6] Node.js kontrol ediliyor...
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [HATA] Node.js komutu bulunamadi!
    echo Lutfen sunlari kontrol edin:
    echo 1. Node.js yuklu mu? (https://nodejs.org)
    echo 2. Kurulumdan sonra bilgisayari yeniden baslattiniz mi?
    echo.
    pause
    exit /b 1
)
:: Sürümü ekrana yazdır (delayed expansion kullanmadan)
echo [BASARILI] Node.js aktif.

:: 2. Adim: Git Kontrolu ve Repo Ayari
echo.
echo [2/6] GitHub baglantisi kontrol ediliyor...
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [UYARI] Git bulunamadi! Otomatik guncellemeler calismayabilir.
    echo Sadece kopyaladiginiz dosyalar uzerinden kurulum yapilacak.
) else (
    git status >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [BILGI] Git deposu hazirlaniyor...
        git init
        git remote add origin https://github.com/MuratMEC/VKSPINE.git
        git fetch origin main
        git reset --hard origin/main
    ) else (
        echo [BASARILI] Git baglantisi aktif.
    )
)

:: 3. Adim: Paketler
echo.
echo [3/6] Yazilim paketleri yukleniyor (npm install)...
echo Bu islem internet hiziniza gore 1-2 dakika surebilir...
call npm install
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [HATA] Paketler yuklenirken bir sorun oluştu.
    echo Internet baglantinizi kontrol edip tekrar deneyin.
    echo.
    pause
    exit /b 1
)

:: 4. Adim: Veritabani
echo.
echo [4/6] Veritabani yapilandiriliyor...
if not exist database mkdir database
if exist prisma\prisma\dev.db move prisma\prisma\dev.db database\dev.db
if exist dev.db move dev.db database\dev.db
git rm --cached dev.db prisma/prisma/dev.db prisma/dev.db 2>nul

call npx prisma generate
call npx prisma db push --accept-data-loss
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [HATA] Veritabani olusturulurken hata oluştu!
    echo.
    pause
    exit /b 1
)

:: 5. Adim: Varsayilan Veriler
echo.
echo [5/6] Veriler kontrol ediliyor...
call npx prisma db seed
echo [BASARILI] Hazirlik tamamlandi.

:: 6. Adim: Baslatma
echo.
echo [6/6] Uygulama aciliyor...
echo.
echo ===================================================
echo KURULUM TAMAMLANDI! SISTEM BASLATILIYOR...
echo Tarayicida http://localhost:3000 adresi acilacak.
echo Lutfen siyah pencereyi KAPATMAYIN.
echo ===================================================
echo.

start http://localhost:3000
call npm run dev

:: Eger sistem kapanirsa pencere acik kalsin
echo.
echo [BILGI] Uygulama durdu.
pause
