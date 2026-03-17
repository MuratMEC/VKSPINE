@echo off
cd /d "%~dp0"
:: npm komutunun yolunu garantiye almak için gerekirse tam yol yazılabilir
:: ama genelde direkt npm çalışır.
npm run dev