@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title VK Spine Stok - Akilli Kurulum ve Baslatma
color 0B

echo ===================================================
echo     VK SPINE STOK - AKILLI KURULUM VE BASLATMA
echo ===================================================
echo.

:: 1. Adim: Node.js Kontrolu
echo [1/6] Node.js sistem uzerinde araniyor...
node -v >nul 2>&1
if !errorlevel! neq 0 (
    color 0C
    echo.
    echo [HATA] Node.js bulunamadi!
    echo Lutfen https://nodejs.org/ adresinden Node.js (LTS) indirip kurun.
    echo.
    pause
    exit /b 1
) else (
    echo [BASARILI] Node.js bulundu.
)

:: 2. Adim: Git Kontrolu ve Repo Ayari
echo.
echo [2/6] GitHub baglantisi kontrol ediliyor...
git --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [UYARI] Git bulunamadi! Guncellemeleri otomatik alamazsiniz.
    echo Lutfen https://git-scm.com/ adresinden Git kurmaniz onerilir.
) else (
    git status >nul 2>&1
    if !errorlevel! neq 0 (
        echo [BILGI] Klasor henuz bir Git deposu degil. Ayarlaniyor...
        git init
        git remote add origin https://github.com/MuratMEC/VKSPINE.git
        git fetch origin main
        git reset --hard origin/main
    ) else (
        echo [BASARILI] Git baglantisi aktif.
    )
)

:: 3. Adim: Bagimliliklarin (npm install) yuklenmesi
echo.
echo [3/6] Yazilim paketleri (node_modules) yukleniyor...
echo Bu islem internet hiziniza bagli olarak birkac dakika surebilir.
call npm install
if !errorlevel! neq 0 (
    color 0C
    echo.
    echo [HATA] Paket yukleme sirasinda bir sorun olustu!
    pause
    exit /b 1
) else (
    echo [BASARILI] Paketler yuklendi.
)

:: 4. Adim: Veritabani hazirligi (Prisma generate & db push)
echo.
echo [4/6] Veritabani yapisi olusturuluyor...
call npx prisma generate
call npx prisma db push --accept-data-loss
if !errorlevel! neq 0 (
    color 0C
    echo.
    echo [HATA] Veritabani hazirlanirken hata olustu!
    pause
    exit /b 1
) else (
    echo [BASARILI] Veritabani hazir.
)

:: 5. Adim: Seed (Ornek Veri)
echo.
echo [5/6] Varsayilan veriler (Yonetici vb.) kontrol ediliyor...
call npx prisma db seed >nul 2>&1
echo [BASARILI] Veri kontrolu tamamlandi.

:: 6. Adim: Baslatma
echo.
echo [6/6] Sistem baslatiliyor...
echo.
echo ===================================================
echo TEBRIKLER! SISTEM BASARIYLA KURULDU VE BASLATILDI.
echo Tarayicinizda "http://localhost:3000" otomatik acilacak.
echo Lutfen bu pencereyi sistem acikken kapatmayin.
echo ===================================================
echo.

start http://localhost:3000
call npm run dev

pause
