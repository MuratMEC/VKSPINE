# MEDİKAL STOK VE İZLENEBİLİRLİK SİSTEMİ

Oluşturulma Tarihi: 2026-03-01

------------------------------------------------------------------------

## 1. Proje Amacı

Tıbbi cihaz ve ameliyatlarda kullanılan implant/platin ürünlerinin:

-   Lot / Seri numarası takibi
-   Son Kullanım Tarihi (SKT) kontrolü
-   Ameliyat bazlı tüketim kaydı
-   Geri çağırma (Recall) yönetimi
-   Konsinye depo yönetimi
-   Barkod / QR okutma
-   Mobil ve web erişim desteği

sağlayan web tabanlı bir stok ve izlenebilirlik sistemi geliştirilmesi.

------------------------------------------------------------------------

## 2. Sistem Mimarisi

### Backend

-   Python (FastAPI veya Odoo tabanlı yapı)
-   PostgreSQL veritabanı
-   REST API mimarisi

### Frontend

-   React / Next.js (PWA destekli)

### Mobil Erişim

-   PWA ile cep telefonu desteği
-   Android el terminali entegrasyonu
-   Kamera ile barkod/QR okutma

------------------------------------------------------------------------

## 3. Temel Modüller

### 3.1 Ürün Yönetimi

-   Ürün
-   Marka
-   Model
-   Lot No
-   Seri No
-   SKT
-   ÜTS Kodu
-   Steril Durumu

### 3.2 Depo Yönetimi

-   Ana depo
-   Hastane deposu (konsinye)
-   Depolar arası transfer
-   Hareket bazlı stok hesaplama

### 3.3 Ameliyat Modülü

-   Hastane
-   Doktor
-   Ameliyat tarihi
-   Kullanılan ürünler
    -   Seri No
    -   Lot No
    -   SKT
    -   Adet

⚠ Ameliyat kayıtları silinemez. Sadece iptal flag uygulanabilir.

### 3.4 SKT ve FEFO Yönetimi

-   First Expire First Out (FEFO)
-   SKT yaklaşan ürün uyarısı
-   SKT geçmiş ürün kilitleme

### 3.5 Recall (Geri Çağırma)

-   Lot bazlı geri çağırma
-   Hangi ameliyatlarda kullanıldığının raporu
-   Hangi depolarda bulunduğunun raporu

------------------------------------------------------------------------

## 4. Veritabanı Taslak Yapısı

Temel tablolar:

-   product
-   product_lot
-   warehouse
-   stock_move
-   hospital
-   doctor
-   surgery
-   surgery_line
-   recall

Stok hesaplama mantığı:

qty = SUM(in) - SUM(out)

Direkt miktar tutulmaz, hareket bazlı hesap yapılır.

------------------------------------------------------------------------

## 5. Barkod Yapısı

Önerilen standart: GS1

-   (1) GTIN

-   (17) Expiry Date

-   (10) Lot

-   (21) Serial

Sistem bu alanları parse edebilmelidir.

------------------------------------------------------------------------

## 6. Güvenlik ve Loglama

-   Tüm hareketler loglanmalı
-   Audit Trail yapısı
-   Kullanıcı bazlı işlem kaydı
-   Silinemez sistem kayıtları

------------------------------------------------------------------------

## 7. Offline Senaryo

-   Ameliyathane interneti olmayabilir
-   Offline cache yapısı
-   Sonradan senkronizasyon

------------------------------------------------------------------------

## 8. Önerilen Yol

Mevcut Odoo altyapısı üzerine özel Medikal Traceability modülü
geliştirmek veya sıfırdan SaaS mimarisi kurmak.

Odoo tercih edilirse: - Stok modülü hazır - Lot/Serial yönetimi hazır -
Barcode desteği mevcut - Multi-depo desteği var

------------------------------------------------------------------------

## 9. Riskler

-   Hukuki sorumluluk
-   Yanlış izlenebilirlik
-   Veri kaybı
-   Yanlış SKT yönetimi

------------------------------------------------------------------------

## 10. Sonuç

Bu sistem klasik stok yazılımı değildir. ERP + İzlenebilirlik + Hukuki
güvenlik sistemidir.

Doğru mimari ile başlanmalıdır.
