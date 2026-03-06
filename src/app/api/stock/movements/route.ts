import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Stok hareketlerini detaylı include verileri ile getirir.
export async function GET() {
    try {
        const movements = await prisma.stockMovement.findMany({
            include: {
                product: true,
                lot: true,
                customer: true,
                supplier: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 200 // Performans için şimdilik son 200 satırı getir
        });

        return NextResponse.json(movements);
    } catch (error) {
        console.error("Hareketler getirilirken hata:", error);
        return NextResponse.json({ error: "Stok hareketleri listesi alınamadı" }, { status: 500 });
    }
}
