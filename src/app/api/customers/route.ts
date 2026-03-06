import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, contactPerson: true }
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error("Müşteriler getirilirken hata:", error);
        return NextResponse.json({ error: "Müşteriler/Hastaneler alınamadı." }, { status: 500 });
    }
}
