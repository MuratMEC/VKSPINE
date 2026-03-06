import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            where: { isActive: true },
            orderBy: { companyName: 'asc' },
            select: { id: true, companyName: true, contactPerson: true }
        });

        return NextResponse.json(suppliers);
    } catch (error) {
        console.error("Tedarikçiler getirilirken hata:", error);
        return NextResponse.json({ error: "Tedarikçiler alınamadı." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.companyName) {
            return NextResponse.json({ error: "Firma adı zorunludur." }, { status: 400 });
        }

        const newSupplier = await prisma.supplier.create({
            data: {
                companyName: body.companyName,
                taxOffice: body.taxOffice || null,
                taxNumber: body.taxNumber || null,
                contactPerson: body.contactPerson || null,
                phone: body.phone || null,
                email: body.email || null,
                address: body.address || null,
                notes: body.notes || null,
                isActive: true
            }
        });

        return NextResponse.json(newSupplier, { status: 201 });
    } catch (error) {
        console.error("Tedarikçi oluşturulurken hata:", error);
        return NextResponse.json({ error: "Tedarikçi oluştururken bir veritabanı hatası oluştu." }, { status: 500 });
    }
}
