import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { products } = body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: "İçe aktarılacak Excel verisi bulunamadı veya format hatalı." }, { status: 400 });
        }

        // Mevcut kategorileri ve set kategorilerini çek (isim -> id eşlemesi için)
        const existingCategories = await prisma.category.findMany();
        const existingSetCategories = await prisma.setCategory.findMany();

        const categoryMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c.id]));
        const setCategoryMap = new Map(existingSetCategories.map(c => [c.name.toLowerCase(), c.id]));

        let successCount = 0;
        let skipCount = 0;
        const errors = [];

        for (const prod of products) {
            // Türkçe ve İngilizce alan adlarını destekle
            const utsCode = prod.utsKodu || prod.utsCode;
            const name = prod.urunAdi || prod.name;
            const brand = prod.marka || prod.brand;
            const dimension = prod.olcuBoyut || prod.dimension;
            const categoryName = prod.kategori;
            const setCategoryName = prod.setKategori;
            const minStockLvl = prod.minStokSeviyesi || prod.minStockLvl;
            const hasExpiration = prod.sktTakibi !== undefined ? prod.sktTakibi : prod.hasExpiration;

            // Sadece ürün adı zorunlu — ÜTS dahil diğer tüm alanlar opsiyonel
            if (!name) {
                skipCount++;
                errors.push(`Satır atlandı — ürün adı (urunAdi veya name) bulunamadı.`);
                continue;
            }

            // Kategori isminden ID bul, yoksa oluştur
            let categoryId: string | null = null;
            if (categoryName) {
                const cKey = String(categoryName).trim().toLowerCase();
                if (categoryMap.has(cKey)) {
                    categoryId = categoryMap.get(cKey)!;
                } else {
                    const newCat = await prisma.category.create({
                        data: { name: String(categoryName).trim(), isActive: true }
                    });
                    categoryMap.set(cKey, newCat.id);
                    categoryId = newCat.id;
                }
            }

            // Set Kategori isminden ID bul, yoksa oluştur
            let setCategoryId: string | null = null;
            if (setCategoryName) {
                const scKey = String(setCategoryName).trim().toLowerCase();
                if (setCategoryMap.has(scKey)) {
                    setCategoryId = setCategoryMap.get(scKey)!;
                } else {
                    const newSetCat = await prisma.setCategory.create({
                        data: { name: String(setCategoryName).trim(), isActive: true }
                    });
                    setCategoryMap.set(scKey, newSetCat.id);
                    setCategoryId = newSetCat.id;
                }
            }

            const productData = {
                name: String(name).trim(),
                brand: brand ? String(brand) : null,
                dimension: dimension ? String(dimension) : null,
                categoryId: categoryId,
                setCategoryId: setCategoryId,
                minStockLvl: minStockLvl ? parseInt(minStockLvl) : 5,
                hasExpiration: hasExpiration !== undefined ? Boolean(hasExpiration) : true,
            };

            try {
                if (utsCode) {
                    // ÜTS kodu varsa upsert yap (varsa güncelle, yoksa oluştur)
                    await prisma.product.upsert({
                        where: { utsCode: String(utsCode).trim() },
                        update: productData,
                        create: {
                            ...productData,
                            utsCode: String(utsCode).trim(),
                        }
                    });
                } else {
                    // ÜTS kodu yoksa direkt yeni kayıt oluştur
                    await prisma.product.create({
                        data: productData
                    });
                }
                successCount++;
            } catch (err: any) {
                skipCount++;
                errors.push(`Ürün "${name}" işlenirken hata: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: "İçe aktarım tamamlandı",
            successCount,
            skipCount,
            errors: errors.length > 0 ? errors : undefined
        }, { status: 200 });

    } catch (error) {
        console.error("Toplu içe aktarım hatası:", error);
        return NextResponse.json({ error: "Sunucu tarafında ciddi bir Excel işleme hatası oluştu." }, { status: 500 });
    }
}

