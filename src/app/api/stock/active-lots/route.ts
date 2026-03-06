import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Stoğu 0'dan büyük olan Lot'ları ve onlara ait ürün bilgilerini getir.
        const activeLots = await prisma.lotSerial.findMany({
            where: {
                quantity: { gt: 0 }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        utsCode: true,
                    }
                }
            },
            orderBy: {
                expDate: 'asc' // İlk SKT bitene öncelik vermek iyi pratiktir
            }
        });

        // Veriyi frontendin arama/dropdown içinde daha kolay kullanabileceği formata dönüştür
        const formattedLots = activeLots.map(lot => ({
            id: lot.id,
            lotNo: lot.lotNo,
            productId: lot.product.id,
            productName: lot.product.name,
            productUts: lot.product.utsCode,
            quantity: lot.quantity,
            expDate: lot.expDate,
            // Arama filtresi için birleşik alan
            searchString: `${lot.product.name} ${lot.lotNo} ${lot.product.utsCode || ''}`.toLowerCase()
        }));

        return NextResponse.json(formattedLots);
    } catch (error) {
        console.error("Lot listesi alınırken hata:", error);
        return NextResponse.json({ error: "Kayıtlı ve stoğu olan Lotlar alınamadı." }, { status: 500 });
    }
}
