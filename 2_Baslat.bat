@echo off
title VK Spine Stok - Calisiyor
color 0A

echo ===================================================
echo   VK SPINE STOK UYGULAMASI BASLATILIYOR...
echo ===================================================
echo Sistemi kullanmak icin birazdan tarayiciniz otomatik acilacak veya
echo asagidaki adresi kopyalayip Google Chrome'a yapistirabilirsiniz:
echo.
echo    http://localhost:3000
echo.
echo Lutfen sistem calisirken bu siyah pencereyi KAPATMAYIN!
echo Kapatirsaniz sistem durur.
echo ===================================================

start http://localhost:3000
npm run dev
pause
