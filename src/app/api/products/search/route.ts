import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        // Stok miktarı 0'dan büyük olan ürünleri ve Lot'larını dön
        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { utsCode: { contains: query } }
                ]
            },
            include: {
                // İlgili ürünün stokta bulunan lotlarını FEFO (En yakın SKT ilk sırada) mantığıyla getir:
                lotSerials: {
                    where: {
                        quantity: { gt: 0 }
                    },
                    orderBy: [
                        { expDate: 'asc' }, // Önce son kullanma tarihi yaklaşanlar
                        { createdAt: 'asc' } // Sonra sisteme ilk girenler (FIFO takviyesi)
                    ]
                }
            },
            take: 10 // Arama performansı için en fazla 10 sonuç
        });

        return NextResponse.json(products);

    } catch (error) {
        console.error("Arama servisi hatası:", error);
        return NextResponse.json({ error: "Ürünler aranamadı" }, { status: 500 });
    }
}
