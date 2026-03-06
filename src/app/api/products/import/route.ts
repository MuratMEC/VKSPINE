import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { products } = body; // Gelen JSON verisi ürün dizisi içermeli

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: "İçe aktarılacak Excel verisi bulunamadı veya format hatalı." }, { status: 400 });
        }

        let successCount = 0;
        let skipCount = 0;
        const errors = [];

        // Beklenen minimum Excel Formatı örneklemesi:
        // [{ utsCode: '123', name: 'Platin', brand: 'X', minStockLvl: 5, hasExpiration: true }]

        // Transaction (Çoklu Kayıt İşlemi) yerine for...of ile Upsert kullanıyoruz ki 
        // varolan UBB kodlarını güncellesin, olmayanları eklesin.
        for (const prod of products) {

            // Eksik satırları atla
            if (!prod.utsCode || !prod.name) {
                skipCount++;
                errors.push(`Ürün Adı: ${prod.name || 'Bilinmiyor'} - Kaydedilemedi çünkü ÜTS veya İsim eksik.`);
                continue;
            }

            try {
                await prisma.product.upsert({
                    where: { utsCode: String(prod.utsCode).trim() },
                    update: {
                        name: String(prod.name),
                        brand: prod.brand ? String(prod.brand) : null,
                        // Sayısal değerlere çevir ki veritabanı yemesin
                        minStockLvl: prod.minStockLvl ? parseInt(prod.minStockLvl) : 5,
                        // True/False kontrolü
                        hasExpiration: prod.hasExpiration !== undefined ? Boolean(prod.hasExpiration) : true,
                    },
                    create: {
                        utsCode: String(prod.utsCode).trim(),
                        name: String(prod.name),
                        brand: prod.brand ? String(prod.brand) : null,
                        minStockLvl: prod.minStockLvl ? parseInt(prod.minStockLvl) : 5,
                        hasExpiration: prod.hasExpiration !== undefined ? Boolean(prod.hasExpiration) : true,
                    }
                });
                successCount++;
            } catch (err: any) {
                skipCount++;
                errors.push(`${prod.utsCode} kodlu ürün işlenirken hata: ${err.message}`);
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
