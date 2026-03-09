# 🛒 VK-Spine Stok Sistemi Geliştirme Raporu

Bu belge, sistem üzerinde yapılan son güncellemeleri, eklenen özellikleri ve iş kurallarını özetler.

## 🚀 Yeni Özellikler

### 1. Çoklu Alan Arama (Multi-Field Search)
Aşağıdaki tüm sayfalara tek bir arama kutusu yerine **4 ayrı filtreleme alanı** eklendi. Bu sayede Ürün Adı, Ölçü, Kategori ve Set Kategorisi bazında çok daha hassas aramalar yapılabilmektedir:
- **Ürün Yönetimi**
- **Depo (Stok) Durumu**
- **Stok Giriş (Fatura Giriş)**
- **Stok Çıkış (Ameliyat)**

### 2. Esnek Stok Girişi
- **Fatura / İrsaliye No**: Artık bu alanları girmek zorunlu değildir. Boş bırakılarak da stok kaydı yapılabilir.
- **Hızlı Giriş**: Giriş ekranındaki Lot, SKT ve Alış Fiyatı alanları kaldırılarak sürecin hızlanması sağlandı. Gerektiğinde bu bilgiler ürün detayından yönetilebilir.

### 3. Tarih Aralıklı Raporlama
- **Stok Hareketleri**: Artık "Başlangıç" ve "Bitiş" tarihleri seçilerek iki tarih arasındaki tüm giriş-çıkış hareketleri listelenebilir ve Excel'e aktarılabilir.

### 4. Dashboard Görsel İyileştirmeler
- **En Çok Çıkarılan Ürünler Grafiği**: Grafik üzerinde mouse ile gezinirken çıkan bilgi kutusunun (tooltip) tasarımı ve renkleri daha estetik (Koyu Lacivert / Premium) hale getirildi.

---

## 🛡️ Kritik İş Kuralları

### 📦 Stok Kontrolü (Yetersiz Stok Engelleme)
Sistemimiz, depoda olmayan bir ürünün çıkışının yapılmasını teknik olarak engeller:
- **Otomatik Kontrol**: Stok Çıkış (Ameliyat) ekranında, seçilen Lot'un mevcut miktarından daha fazla bir sayı girilirse sistem uyarı verir.
- **API Koruması**: Arayüz geçilse dahi, arka plandaki API veritabanı miktarını kontrol eder ve yetersiz stok durumunda işlemi iptal ederek hata döndürür.

### 🧾 Fatura ve İrsaliye
- Veritabanı yapısı bu alanları `optional` (isteğe bağlı) olarak destekler. Kayıt esnasında girilmezse veritabanında "Belirtilmedi" olarak görünür.

---

## 💻 Teknik Yapı Özeti
- **Framework**: Next.js 14 (App Router)
- **Veritabanı**: SQLite (Prisma ORM ile yönetiliyor)
- **UI Kütüphanesi**: Mantine UI & Tailwind CSS
- **Grafikler**: @mantine/charts (Recharts tabanlı)

---
*Bu rapor sistemin güncel durumunu yansıtmaktadır. Yeni talepleriniz doğrultusunda güncellenecektir.*
