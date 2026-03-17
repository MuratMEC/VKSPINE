@echo off
setlocal EnableDelayedExpansion

title VK Spine - Veritabani Yedekleme ve Geri Yukleme Yoneticisi
color 0B

:: Klasor yollari
set "DB_DIR=%~dp0database"
set "BACKUP_DIR=%~dp0backup"
set "DB_FILE=%DB_DIR%\dev.db"

:: Backup klasoru yoksa olustur
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:MENU
cls
echo =======================================================
echo          VK SPINE - YEDEKLEME VE GERI YUKLEME
echo =======================================================
echo.
echo    1. Yeni Yedek Al
echo    2. Eski Yedegi Geri Yukle (Restore)
echo    3. Cikis
echo.
echo =======================================================
set /p secim="Lutfen bir islem secin (1-3): "

if "%secim%"=="1" goto YEDEK_AL
if "%secim%"=="2" goto YEDEK_YUKLE
if "%secim%"=="3" goto CIKIS
goto MENU

:YEDEK_AL
cls
echo [Islem: Yedekleme Baslatiliyor...]
if not exist "!DB_FILE!" (
    echo.
    echo HATA: Veritabani dosyasi bulunamadi ^(Yol: "!DB_FILE!"^)
    pause
    goto MENU
)

:: Tarih ve saat bilgisini hatasiz parcala (Powershell kullanarak)
for /f "usebackq tokens=*" %%A in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'"`) do set "TIMESTAMP=%%A"

set "BACKUP_NAME=dev_%TIMESTAMP%.db"
set "BACKUP_PATH=%BACKUP_DIR%\%BACKUP_NAME%"

echo Veritabani kopyalaniyor...
copy "%DB_FILE%" "%BACKUP_PATH%" >nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo BASARILI: Yedekleme tamamlandi.
    echo Olusturulan Dosya: backup\%BACKUP_NAME%
) else (
    echo.
    echo HATA: Yedekleme sirasinda bir sorun olustu.
)
echo.
pause
goto MENU

:YEDEK_YUKLE
cls
echo =======================================================
echo                 YEDEK GERI YUKLEME
echo =======================================================
echo.
echo DIKKAT: Eski bir yedegi yuklemek mevcut verilerinizi 
echo silecek ve eski duruma dondurecektir. Islem oncesinde 
echo mevcut durumun otomatik guvenlik yedegi 
echo "restore_oncesi_otomatik_yedek_..." 
echo adiyla alinacaktir.
echo.
echo Mevcut Yedekler:
echo -------------------------------------------------------

set count=0
for %%F in ("%BACKUP_DIR%\*.db") do (
    set /a count+=1
    set "file[!count!]=%%~nxF"
    echo   [!count!] %%~nxF
)

if !count! EQU 0 (
    echo.
    echo HATA: Hic yedek dosyasi bulunamadi. (Klasor: backup)
    pause
    goto MENU
)
echo -------------------------------------------------------
echo   [0] Iptal et ve Ana Menuye Don

echo.
set /p secilen_id="Yuklemek istediginiz yedegin KODUNU (koseli parantez icindeki sayi) girin: "

if "%secilen_id%"=="0" goto MENU

if not defined file[%secilen_id%] (
    echo.
    echo HATA: Gecersiz secim yaptiniz.
    pause
    goto YEDEK_YUKLE
)

set "SECILEN_DOSYA=!file[%secilen_id%]!"
set "RESTORE_SRC=%BACKUP_DIR%\!SECILEN_DOSYA!"

echo.
echo SECILEN YEDEK: !SECILEN_DOSYA!
echo.
set /p onay="Bu yedegi yuklemek istediginize KESINLIKLE EMIN MISINIZ? (Evet icin E veya Y, Iptal icin N): "

if /i "%onay%"=="E" goto RESTORE_ISLEMI
if /i "%onay%"=="Y" goto RESTORE_ISLEMI
if /i "%onay%"=="EVET" goto RESTORE_ISLEMI

echo Islem iptal edildi.
pause
goto MENU

:RESTORE_ISLEMI
echo.
echo Lutfen bekleyin...
for /f "usebackq tokens=*" %%A in (`powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'"`) do set "TIMESTAMP=%%A"
set "AUTO_BACKUP_NAME=restore_oncesi_otomatik_yedek_%TIMESTAMP%.db"

if exist "%DB_FILE%" (
    echo 1/2 Mevcut durumun guvenlik yedegi aliniyor...
    copy "%DB_FILE%" "%BACKUP_DIR%\%AUTO_BACKUP_NAME%" >nul
    if %ERRORLEVEL% NEQ 0 (
         echo HATA: Guvenlik yedegi alinamadi. Olasiligi dusurmemek icin islem durduruldu.
         echo Lutfen sistemde calisan VK Spine Servisini kapatip oyle deneyin.
         pause
         goto MENU
    )
)

echo 2/2 Eski yedek geri yukleniyor %SECILEN_DOSYA%...
copy /Y "%RESTORE_SRC%" "%DB_FILE%" >nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo BASARILI: Sistem %SECILEN_DOSYA% yedegine geri donduruldu.
    echo Eger bir terslik fark ederseniz "backup\%AUTO_BACKUP_NAME%" 
    echo dosyasi islem oncesi alinan guvenlik yedeginizdir.
) else (
    echo.
    echo HATA: Yedek geri yukleme islemi basarisiz oldu. Lutfen servisi durdurup tekrar deneyin.
)

echo.
pause
goto MENU

:CIKIS
exit
