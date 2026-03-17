# VK Spine Stok Takibi - Kurulum Kılavuzu

Bu sistemi başka bir bilgisayara kurmak için aşağıdaki adımları izleyin:

## 1. Hazırlık
Sistemin çalışması için bilgisayarınızda şu yazılımların kurulu olması gerekir:
- **Node.js**: [https://nodejs.org/](https://nodejs.org/) (En az v18 sürümü önerilir)
- **Git**: [https://git-scm.com/](https://git-scm.com/) (İsteğe bağlı, kodları indirmek için)

## 2. Kurulum
Proje klasörünü bilgisayarınıza indirdikten sonra:
1. Klasörün içindeki **`1_Kurulum.bat`** dosyasını çalıştırın.
2. Bu işlem gerekli tüm paketleri yükleyecek, veritabanını hazırlayacak ve örnek verileri sisteme aktaracaktır.
3. İşlem tamamlandığında bir tuşa basarak pencereyi kapatın.

## 3. Sistemi Başlatma
Kurulumdan sonra sistemi her kullanmak istediğinizde:
- **`2_Baslat.bat`** dosyasını çalıştırın.
- Siyah ekran (terminal) açık kaldığı sürece sistem aktiftir.
- Tarayıcıdan **`http://localhost:3000`** adresine girerek sistemi kullanmaya başlayabilirsiniz.

---

### Diğer Batch Dosyaları Ne İşe Yarar?
- **`Tam_Otomatik_Kurulum.bat`**: Her şeyi tek seferde (kurulum + başlatma) yapar.
- **`3_Guncelle_Silmeden.bat`**: Kodlarda bir değişiklik olduğunda verilerinizi silmeden günceller.
- **`5_Servis_Kur.bat`**: Sistemi Windows Servisi olarak kurar (Arka planda otomatik çalışması için).
- **`KOLAY_KURULUM.bat`**: Hızlı kurulum ve başlatma için alternatif bir yoldur.
