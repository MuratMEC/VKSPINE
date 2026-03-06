# 🏥 MediStock — Tıbbi Ürün Stok Yönetim Sistemi

## Kapsamlı Geliştirme Yol Haritası

> **Hazırlayan:** Claude (Anthropic)  
> **Versiyon:** 1.0  
> **Tarih:** Mart 2026  
> **Hedef Kitle:** Tıbbi ürün satışı yapan firmalar için web tabanlı stok modülü

---

## 📌 İçindekiler

1. [Proje Vizyonu](#1-proje-vizyonu)
2. [Teknoloji Yığını Önerileri](#2-teknoloji-yığını-önerileri)
3. [Genel Mimari Yapı](#3-genel-mimari-yapı)
4. [Veritabanı Tasarımı](#4-veritabanı-tasarımı)
5. [Stok Modülü — Tıbbı Ürün Özgü Gereksinimler](#5-stok-modülü--tıbbi-ürün-özgü-gereksinimler)
6. [Ekranlar ve Fonksiyonlar](#6-ekranlar-ve-fonksiyonlar)
7. [Etap Bazlı Yol Haritası](#7-etap-bazlı-yol-haritası)
8. [Klasör Yapısı](#8-klasör-yapısı)
9. [Gelecek Modüller](#9-gelecek-modüller)
10. [Vibe Coder İçin Pratik İpuçları](#10-vibe-coder-için-pratik-ipuçları)

---

## 1. Proje Vizyonu

**MediStock**, tıbbi ürün satışı yapan firmaların:

- Ürünleri lot numarası ve son kullanım tarihi bazında takip etmesini,
- Mevzuata uygun kayıt tutmasını (SGK, İTS, Sağlık Bakanlığı),
- Stok hareketlerini gerçek zamanlı izlemesini,
- İlerleyen dönemlerde satış, fatura, müşteri ve raporlama modüllerini entegre edebilmesini

sağlayan, **web tabanlı, modüler ve ölçeklenebilir** bir uygulamadır.

### Temel İlkeler

- **Modüler yapı:** Her modül bağımsız geliştirilebilir ve eklenebilir olmalı
- **Mevzuat uyumluluğu:** Türkiye İlaç ve Tıbbi Cihaz Kurumu (TİTCK) gerekliliklerine uygun
- **Kullanıcı dostu:** Teknik bilgisi olmayan depo personeli de kullanabilmeli
- **Audit trail:** Her işlemin kimin, ne zaman, ne yaptığı kayıt altına alınmalı

---

## 2. Teknoloji Yığını Önerileri

### Seçenek A — Hızlı Başlangıç (Vibe Coder için önerilir)

| Katman | Teknoloji | Neden? |
|--------|-----------|--------|
| **Frontend** | Next.js 14 (React) | Full-stack, SEO dostu, AI araçlarıyla kolay |
| **UI Kütüphanesi** | Shadcn/UI + Tailwind CSS | Hazır bileşenler, profesyonel görünüm |
| **Backend** | Next.js API Routes | Ayrı sunucu gerekmez, tek proje |
| **Veritabanı** | PostgreSQL (Supabase) | Ücretsiz tier, gerçek zamanlı, auth dahil |
| **ORM** | Prisma | Türkçe hata mesajları, görsel şema |
| **Auth** | Supabase Auth veya NextAuth | Hazır kullanıcı yönetimi |
| **Deploy** | Vercel | Ücretsiz, otomatik CI/CD |

### Seçenek B — Kurumsal Yapı (Ekip varsa)

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | React + Vite |
| **Backend** | Node.js + Express veya FastAPI (Python) |
| **Veritabanı** | PostgreSQL |
| **ORM** | Prisma veya SQLAlchemy |
| **Auth** | Keycloak veya Auth0 |
| **Deploy** | Docker + VPS veya AWS |

> **Vibe Coder Tavsiyesi:** Seçenek A ile başlayın. Supabase size veritabanı + auth + API'yi bedavaya veriyor. Next.js ile hem frontend hem backend tek projede oluyor. Cursor veya v0.dev ile çok hızlı ilerlenir.

---

## 3. Genel Mimari Yapı

```
┌─────────────────────────────────────────────────────────┐
│                    TARAYICI (Browser)                    │
│              Next.js Frontend (React)                    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / WebSocket
┌───────────────────────▼─────────────────────────────────┐
│                 Next.js API Routes                        │
│          (Middleware, Auth, Validasyon)                   │
└───────────────────────┬─────────────────────────────────┘
                        │ Prisma ORM
┌───────────────────────▼─────────────────────────────────┐
│              PostgreSQL Veritabanı                        │
│                  (Supabase)                               │
└─────────────────────────────────────────────────────────┘
```

### Modüler Yapı Prensibi

```
Etap 1: Stok Modülü        ← ŞU AN BURADAYIZ
Etap 2: Satış Modülü
Etap 3: Satın Alma Modülü
Etap 4: Müşteri (CRM) Modülü
Etap 5: Raporlama & Dashboard
Etap 6: Fatura & Muhasebe Entegrasyonu
Etap 7: İTS (İlaç Takip Sistemi) Entegrasyonu
```

---

## 4. Veritabanı Tasarımı

### Temel Tablolar (Stok Modülü)

#### `urunler` — Ürün Kataloğu

```sql
CREATE TABLE urunler (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barkod          VARCHAR(50) UNIQUE,          -- EAN-13 veya UDI barkod
  its_kodu        VARCHAR(50),                 -- İlaç Takip Sistemi kodu
  urun_adi        VARCHAR(255) NOT NULL,
  marka           VARCHAR(100),
  kategori_id     UUID REFERENCES kategoriler(id),
  urun_turu       VARCHAR(50),                 -- 'ilac', 'tibbi_cihaz', 'sarf_malzeme', 'kozmetik'
  olcum_birimi    VARCHAR(20),                 -- 'adet', 'kutu', 'ml', 'mg'
  aktif           BOOLEAN DEFAULT true,
  aciklama        TEXT,
  olusturma_tarihi TIMESTAMP DEFAULT NOW(),
  guncelleme_tarihi TIMESTAMP DEFAULT NOW()
);
```

#### `lot_seri` — Lot / Seri Numarası Yönetimi (TIBBİ ÜRÜN ÖZGÜ)

```sql
CREATE TABLE lot_seri (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  urun_id           UUID REFERENCES urunler(id) NOT NULL,
  lot_no            VARCHAR(100) NOT NULL,      -- Üretici lot numarası
  seri_no           VARCHAR(100),               -- Seri numarası (cihazlar için)
  son_kullanim_tarihi DATE NOT NULL,            -- SKT — kritik alan!
  uretim_tarihi     DATE,
  tedarikci_id      UUID REFERENCES tedarikciler(id),
  fatura_no         VARCHAR(100),               -- Giriş faturası
  giris_tarihi      DATE DEFAULT CURRENT_DATE,
  giris_miktari     DECIMAL(10,3) NOT NULL,
  mevcut_miktar     DECIMAL(10,3) NOT NULL,     -- Anlık stok
  raf_konumu        VARCHAR(50),                -- Raf/depo konumu
  soguk_zincir      BOOLEAN DEFAULT false,      -- Soğuk zincir gereksinimi?
  karantina         BOOLEAN DEFAULT false,      -- Karantinada mı?
  karantina_sebebi  TEXT,
  durum             VARCHAR(20) DEFAULT 'aktif', -- 'aktif', 'tukendi', 'imha', 'iade'
  olusturan_id      UUID REFERENCES kullanicilar(id),
  olusturma_tarihi  TIMESTAMP DEFAULT NOW()
);
```

#### `stok_hareketleri` — Her İşlemin Kaydı

```sql
CREATE TABLE stok_hareketleri (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_seri_id     UUID REFERENCES lot_seri(id) NOT NULL,
  urun_id         UUID REFERENCES urunler(id) NOT NULL,
  hareket_turu    VARCHAR(30) NOT NULL,         
  -- 'giris', 'cikis', 'iade_giris', 'iade_cikis', 
  -- 'imha', 'transfer', 'sayim_duzeltme', 'karantina'
  miktar          DECIMAL(10,3) NOT NULL,       -- Pozitif = giriş, Negatif = çıkış
  onceki_miktar   DECIMAL(10,3),
  sonraki_miktar  DECIMAL(10,3),
  referans_no     VARCHAR(100),                 -- Sipariş/fatura no
  aciklama        TEXT,
  kullanici_id    UUID REFERENCES kullanicilar(id),
  islem_tarihi    TIMESTAMP DEFAULT NOW()
);
```

#### `skt_takip` — Son Kullanım Tarihi Alarm Tablosu

```sql
CREATE TABLE skt_uyarilari (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_seri_id     UUID REFERENCES lot_seri(id),
  uyari_turu      VARCHAR(20),   -- '90_gun', '60_gun', '30_gun', 'gecmis'
  uyari_tarihi    DATE,
  goruldu         BOOLEAN DEFAULT false,
  goruldu_tarihi  TIMESTAMP,
  goruldu_kullanici UUID REFERENCES kullanicilar(id)
);
```

#### `kategoriler`

```sql
CREATE TABLE kategoriler (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad        VARCHAR(100) NOT NULL,
  ust_id    UUID REFERENCES kategoriler(id),  -- Alt kategori desteği
  aktif     BOOLEAN DEFAULT true
);
```

#### `tedarikciler`

```sql
CREATE TABLE tedarikciler (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firma_adi       VARCHAR(255) NOT NULL,
  vergi_no        VARCHAR(20),
  yetkili_kisi    VARCHAR(100),
  telefon         VARCHAR(20),
  email           VARCHAR(100),
  adres           TEXT,
  aktif           BOOLEAN DEFAULT true
);
```

#### `kullanicilar`

```sql
CREATE TABLE kullanicilar (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  ad_soyad    VARCHAR(100),
  rol         VARCHAR(20),  -- 'admin', 'depo_sorumlusu', 'satis', 'okuma'
  aktif       BOOLEAN DEFAULT true
);
```

### İlişki Özeti

```
kategoriler
    └── urunler (kategori_id)
            └── lot_seri (urun_id)
                    └── stok_hareketleri (lot_seri_id)
                    └── skt_uyarilari (lot_seri_id)
tedarikciler
    └── lot_seri (tedarikci_id)
kullanicilar
    └── stok_hareketleri (kullanici_id)
    └── skt_uyarilari (goruldu_kullanici)
```

---

## 5. Stok Modülü — Tıbbi Ürün Özgü Gereksinimler

### 5.1 Son Kullanım Tarihi (SKT) Yönetimi

Tıbbi ürünlerde SKT takibi **zorunludur ve kritiktir**.

**Kurallar:**

- Her lot girişinde SKT zorunlu alan olmalı
- SKT geçmiş ürünler otomatik işaretlenmeli ve satışa kapatılmalı
- **90 gün, 60 gün, 30 gün** kala uyarı bildirimleri oluşturulmalı
- SKT'ye göre otomatik **FEFO (First Expired, First Out)** önerisi yapılmalı
- Anasayfada SKT uyarı dashboard'u olmalı

**FEFO vs FIFO:**
> Tıbbi ürünlerde FIFO (ilk giren ilk çıkar) yerine **FEFO** (ilk expire olan ilk çıkar) kullanılmalıdır. Sistem, çıkış yaparken kullanıcıya hangi lot'u önce kullanması gerektiğini önermelidir.

### 5.2 Lot / Seri Numarası Takibi

- Her ürün girişi mutlaka lot numarasıyla yapılmalı
- Aynı ürünün birden fazla lot'u ayrı ayrı takip edilmeli
- Tıbbi cihazlarda seri numarası da ayrıca kaydedilmeli
- Bir lot'tan kaç tane çıktığı, kimin aldığı tam izlenebilir olmalı
- **Geri çağırma (recall) senaryosu:** Belirli bir lot'u içeren tüm satışlar saniyeler içinde listelenmeli

### 5.3 Ürün Türüne Göre Özel Alanlar

```
İLAÇ:
  - Etken madde
  - ATC kodu
  - Reçete durumu (reçeteli/reçetesiz)
  - Kalem/barkod (ambalaj kodu)
  - SGK geri ödeme kodu
  - Soğuk zincir (2-8°C mi?)

TIBBİ CİHAZ:
  - UDI (Unique Device Identification) numarası
  - CE belgesi numarası
  - Risk sınıfı (Sınıf I, IIa, IIb, III)
  - Garanti süresi
  - Tekrar kullanılabilir mi?

SARF MALZEME:
  - Sterilizasyon durumu
  - Sterilizasyon tarihi
  - Ambalaj bütünlüğü takibi

KOZMETİK/DERM.:
  - CPNP kayıt numarası
  - İçerik listesi
```

### 5.4 Depo Yönetimi

- Raf/lokasyon bazlı stok tutma
- Soğuk zincir bölgesi ayrımı (+2/+8°C, -20°C vb.)
- Karantina alanı (hasarlı, şüpheli ürünler için)
- Birden fazla depo desteği (ileride)

### 5.5 Stok Sayımı

- Dönemsel sayım desteği
- Sayım farkı kayıt altına alınmalı
- Sayım düzeltmesi audit log'a işlenmeli

### 5.6 Kritik Stok Seviyeleri

- Her ürün için minimum ve maksimum stok seviyesi tanımlanabilmeli
- Kritik seviyenin altına düşünce uyarı verilmeli

---

## 6. Ekranlar ve Fonksiyonlar

### 6.1 Dashboard (Ana Sayfa)

```
┌──────────────────────────────────────────────────────┐
│  📦 Toplam SKU: 247    ⚠️ SKT Uyarısı: 12 ürün      │
│  📉 Kritik Stok: 5     🔴 SKT Geçmiş: 3 ürün        │
├──────────────────────────────────────────────────────┤
│  SKT Uyarı Listesi (30 gün içinde dolacaklar)        │
│  Kritik Stok Uyarıları                               │
│  Son Stok Hareketleri                                │
│  Hızlı İşlem Butonları: [Giriş] [Çıkış] [Sayım]     │
└──────────────────────────────────────────────────────┘
```

### 6.2 Ürün Yönetimi

- **Ürün Listesi:** Filtreleme (kategori, tür, aktif/pasif), arama, dışa aktarma
- **Ürün Ekle/Düzenle:** Tüm ürün bilgileri formu
- **Ürün Detayı:** Lot listesi, stok özeti, hareket geçmişi

### 6.3 Stok Giriş Ekranı

```
Ürün Seç (barkod okuyucu veya arama)
  ↓
Lot Bilgileri Gir:
  - Lot Numarası *
  - Son Kullanım Tarihi * (tarih picker + görsel uyarı)
  - Seri No (opsiyonel)
  - Üretim Tarihi
  ↓
Miktar ve Kaynak:
  - Giriş Miktarı *
  - Tedarikçi *
  - Fatura Numarası
  - Raf Konumu
  ↓
[Kaydet ve Devam] [Kaydet ve Kapat]
```

### 6.4 Stok Çıkış Ekranı

```
Ürün Seç
  ↓
Sistem FEFO sıralamasına göre lot önerir:
  [ ] Lot: ABC123 — SKT: 15.03.2026 — Mevcut: 50 adet  ← ÖNERİLEN
  [ ] Lot: DEF456 — SKT: 10.06.2026 — Mevcut: 30 adet
  ↓
Miktar Gir
  ↓
Referans (Müşteri/Sipariş No)
  ↓
[Çıkış Yap]
```

### 6.5 Lot / SKT Takip Ekranı

- Tüm lot'ların listesi
- SKT'ye göre renk kodlaması:
  - 🔴 Kırmızı: SKT geçmiş
  - 🟠 Turuncu: 30 gün içinde dolacak
  - 🟡 Sarı: 60 gün içinde dolacak
  - 🟢 Yeşil: 90+ gün
- Lot bazında hareket geçmişi

### 6.6 Stok Hareketleri

- Tüm hareketlerin zaman çizelgesi
- Filtreleme: tarih, ürün, hareket türü, kullanıcı
- Dışa aktarma: Excel, PDF

### 6.7 Raporlar

- SKT dolacak ürünler raporu
- Stok durum raporu (anlık)
- Lot bazında giriş-çıkış raporu
- Tedarikçi bazında giriş raporu
- Sayım fark raporu

---

## 7. Etap Bazlı Yol Haritası

### 🏁 ETAP 1 — Temel Altyapı (1-2 Hafta)

**Amaç:** Projeyi ayağa kaldır, veritabanını kur.

- [ ] Next.js projesi oluştur (`npx create-next-app@latest medistock`)
- [ ] Tailwind CSS + Shadcn/UI kurulumu
- [ ] Supabase projesi oluştur, bağlantı kur
- [ ] Prisma kurulumu ve şema oluşturma
- [ ] Temel layout ve navigasyon menüsü
- [ ] Supabase Auth ile giriş/çıkış ekranı
- [ ] Rol bazlı yetkilendirme middleware'i

**Çıktı:** Giriş yapılabilen, menüsü olan boş bir uygulama.

---

### 🏁 ETAP 2 — Ürün Yönetimi (1 Hafta)

**Amaç:** Ürün kataloğu oluştur.

- [ ] Kategori CRUD işlemleri
- [ ] Ürün CRUD işlemleri (ürün türüne göre dinamik form alanları)
- [ ] Ürün listesi (tablo, filtreler, arama)
- [ ] Barkod alanı ve barkod okuyucu desteği (USB okuyucu zaten klavye gibi çalışır)
- [ ] Toplu ürün import (Excel'den)

**Çıktı:** Ürün kataloğu yönetilebilir durumda.

---

### 🏁 ETAP 3 — Stok Giriş Modülü (1-2 Hafta)

**Amaç:** Lot bazlı stok girişi yapılabilsin.

- [ ] Tedarikçi CRUD işlemleri
- [ ] Stok giriş formu (lot no, SKT, miktar, tedarikçi)
- [ ] SKT validasyonu (geçmiş tarih engelle, yakın tarihe uyarı ver)
- [ ] Stok hareketi otomatik kaydı
- [ ] Raf/lokasyon seçimi

**Çıktı:** Depoya ürün girişi yapılabiliyor, lot takibi başlıyor.

---

### 🏁 ETAP 4 — Stok Çıkış ve FEFO (1 Hafta)

**Amaç:** Doğru lot'tan çıkış yapılsın.

- [ ] Stok çıkış formu
- [ ] FEFO algoritması (SKT'ye göre lot sıralama ve öneri)
- [ ] Yeterli stok kontrolü
- [ ] Çıkışa referans numarası bağlama

**Çıktı:** Çıkış yapılabiliyor, FEFO uygulanıyor.

---

### 🏁 ETAP 5 — SKT Alarm ve Dashboard (1 Hafta)

**Amaç:** Kritik bilgiler görünür olsun.

- [ ] SKT renk kodlama sistemi
- [ ] Dashboard uyarı widget'ları
- [ ] Kritik stok seviyesi tanımlama ve uyarı
- [ ] E-posta bildirimi (Resend veya Nodemailer ile)
- [ ] Scheduled job: Her gün SKT kontrol et (Vercel Cron veya Supabase Edge Function)

**Çıktı:** Sistem proaktif uyarı veriyor.

---

### 🏁 ETAP 6 — Raporlar ve Dışa Aktarma (1 Hafta)

**Amaç:** Karar destek ve kayıt tutma.

- [ ] Stok durum raporu
- [ ] SKT raporu
- [ ] Hareket geçmişi raporu
- [ ] Excel'e aktarma (xlsx kütüphanesi)
- [ ] PDF rapor (jsPDF veya Puppeteer)

**Çıktı:** Raporlar alınabiliyor.

---

### 🏁 ETAP 7 — Stok Sayımı ve İnce Ayarlar (1 Hafta)

**Amaç:** Gerçek depo operasyonuna hazır olsun.

- [ ] Sayım formu (fiziksel sayım girişi)
- [ ] Sayım farkı hesaplama ve düzeltme hareketi
- [ ] Karantina yönetimi
- [ ] İmha kaydı
- [ ] Kullanıcı yönetim ekranı (admin için)
- [ ] Audit log görüntüleme

**Çıktı:** MVP tamamlandı, canlıya alınabilir.

---

## 8. Klasör Yapısı

```
medistock/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + Header
│   │   ├── page.tsx              # Dashboard
│   │   ├── urunler/
│   │   │   ├── page.tsx          # Ürün listesi
│   │   │   ├── yeni/page.tsx     # Ürün ekle
│   │   │   └── [id]/page.tsx     # Ürün detayı
│   │   ├── stok/
│   │   │   ├── giris/page.tsx    # Stok girişi
│   │   │   ├── cikis/page.tsx    # Stok çıkışı
│   │   │   ├── hareketler/page.tsx
│   │   │   └── sayim/page.tsx
│   │   ├── lot-skt/
│   │   │   └── page.tsx          # Lot ve SKT takip
│   │   ├── tedarikciler/
│   │   │   └── page.tsx
│   │   └── raporlar/
│   │       └── page.tsx
│   └── api/                      # API Routes
│       ├── urunler/route.ts
│       ├── stok/
│       │   ├── giris/route.ts
│       │   └── cikis/route.ts
│       └── cron/
│           └── skt-check/route.ts
├── components/
│   ├── ui/                       # Shadcn bileşenleri
│   ├── forms/
│   │   ├── StokGirisForm.tsx
│   │   ├── StokCikisForm.tsx
│   │   └── UrunForm.tsx
│   ├── tables/
│   │   ├── UrunTablosu.tsx
│   │   └── HareketTablosu.tsx
│   └── widgets/
│       ├── SKTUyariKarti.tsx
│       └── StokOzetKarti.tsx
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── supabase.ts
│   ├── fefo.ts                   # FEFO algoritması
│   └── validations.ts            # Zod şemaları
├── prisma/
│   └── schema.prisma             # Veritabanı şeması
└── types/
    └── index.ts                  # TypeScript tipleri
```

---

## 9. Gelecek Modüller

Etap 1 tamamlandıktan sonra aşağıdaki modüller sırasıyla eklenebilir:

| Modül | Açıklama | Öncelik |
|-------|----------|---------|
| **Satış Modülü** | Sipariş oluşturma, müşteri bazlı satış | Yüksek |
| **Satın Alma** | Tedarikçi siparişi, fatura eşleştirme | Yüksek |
| **CRM** | Müşteri ve kurumsal hesap yönetimi | Orta |
| **Fatura** | e-Arşiv entegrasyonu | Orta |
| **İTS Entegrasyonu** | Sağlık Bakanlığı İlaç Takip Sistemi | Yüksek |
| **Barkod Yazdırma** | Etiket ve barkod üretimi | Düşük |
| **Mobil Uygulama** | Depo personeli için barkod okuma | Orta |
| **Muhasebe Entegrasyonu** | Logo, Luca, Netsis vb. | Orta |

---

## 10. Vibe Coder İçin Pratik İpuçları

### AI Araçlarını Doğru Kullan

```
Cursor IDE:         Kod yazma ve refactor
v0.dev:             UI bileşenleri oluşturma
Supabase AI:        SQL sorguları oluşturma
Claude:             Mimari kararlar, code review
```

### Hızlı Başlangıç Komutu

```bash
# 1. Projeyi oluştur
npx create-next-app@latest medistock --typescript --tailwind --app

# 2. Shadcn UI kur
cd medistock && npx shadcn@latest init

# 3. Temel bileşenleri ekle
npx shadcn@latest add table form input button dialog select

# 4. Prisma kur
npm install prisma @prisma/client
npx prisma init
```

### Geliştirme Sırası Önerisi

1. **Önce veriyi çöz:** Prisma şeması %80 doğru olmalı başlamadan
2. **Sonra API:** Her tablo için CRUD endpoint'leri yaz
3. **En son UI:** Çalışan API'ye UI bağla
4. **Test et:** Her etap sonunda gerçek kullanıcıyla test et

### Tıbbi Ürün İçin Unutulmayanlar

> ⚠️ **Kritik:** SKT alanını asla opsiyonel yapma  
> ⚠️ **Kritik:** Her stok hareketini log'la, silme işlemi olmasın  
> ⚠️ **Kritik:** FEFO'yu baştan uygula, sonradan değiştirmek zordur  
> ⚠️ **Kritik:** Kullanıcı işlemlerini audit log'a kaydet (kim, ne zaman, ne yaptı)

---

## 📋 Sonraki Adım

**Şu an yapman gereken tek şey:**

1. Supabase'de ücretsiz hesap aç → [supabase.com](https://supabase.com)
2. Next.js projeni oluştur
3. Bu dokümandaki `ETAP 1` adımlarını sırayla uygula
4. Her adımda Claude veya Cursor'a "şunu yap" diyerek ilerle

---

*Bu yol haritası yaşayan bir belgedir. Proje geliştikçe güncellenmelidir.*

**Sürüm:** 1.0 | **Son Güncelleme:** Mart 2026
