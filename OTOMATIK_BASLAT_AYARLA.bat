@echo off
setlocal
title VK SPINE - OTOMATIK BASLATMA AYARI

echo ==========================================
echo    VK SPINE STOK - OTOMATIK BASLATMA
echo ==========================================
echo.
echo Bu islem, bilgisayar her acildiginda stok sisteminin 
echo arka planda otomatik olarak calismasi saglar.
echo.

set "PROJE_DIZINI=%~dp0"
set "VBS_DOSYASI=%PROJE_DIZINI%Arka_Plan_Baslatici.vbs"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

:: 1. Arka planda calistirma scriptini olustur
echo [1/3] Arka plan baslatici olusturuluyor...
echo Set WinScriptHost = CreateObject("WScript.Shell") > "%VBS_DOSYASI%"
echo WinScriptHost.Run Chr(34) ^& "%PROJE_DIZINI%2_Baslat.bat" ^& Chr(34), 0 >> "%VBS_DOSYASI%"
echo Set WinScriptHost = Nothing >> "%VBS_DOSYASI%"

:: 2. Baslangic klasorune kisayol ekle
echo [2/3] Baslangic klasorune (Startup) kayit yapiliyor...
powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP_FOLDER%\VK_Spine_Stok.lnk');$s.TargetPath='%VBS_DOSYASI%';$s.Save()"

:: 3. Onay
echo [3/3] Islem tamamlandi.
echo.
echo ==========================================
echo    BASARIYLA AYARLANDI!
echo.
echo Artik bilgisayar her acildiginda sistem 
echo arka planda otomatik olarak baslayacaktir.
echo.
echo Not: Sistemi manuel olarak hemen baslatmak icin 
echo hala '2_Baslat.bat' dosyasini kullanabilirsiniz.
echo ==========================================
echo.
pause
