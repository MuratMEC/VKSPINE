import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tek bir müşteriyi getir (GET)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const customer = await prisma.customer.findUnique({ where: { id } });

        if (!customer) {
            return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error: any) {
        console.error("Müşteri getirilirken hata:", error);
        return NextResponse.json({ error: "Müşteri alınamadı." }, { status: 500 });
    }
}

// Müşteriyi güncelle (PUT)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, taxOffice, taxNumber, contactPerson, phone, email, address, notes, isActive } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: "Müşteri adı zorunludur." }, { status: 400 });
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id },
            data: {
                name: name.trim(),
                taxOffice: taxOffice?.trim() || null,
                taxNumber: taxNumber?.trim() || null,
                contactPerson: contactPerson?.trim() || null,
                phone: phone?.trim() || null,
                email: email?.trim() || null,
                address: address?.trim() || null,
                notes: notes?.trim() || null,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json(updatedCustomer);
    } catch (error: any) {
        console.error("Müşteri güncellenirken hata:", error);
        return NextResponse.json({ error: "Müşteri güncellenemedi." }, { status: 500 });
    }
}

// Müşteriyi sil (DELETE)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Müşteriye bağlı ameliyat/stok hareketi var mı kontrol et
        const relatedSurgeries = await prisma.surgery.count({ where: { customerId: id } });
        const relatedMovements = await prisma.stockMovement.count({ where: { customerId: id } });

        if (relatedSurgeries > 0 || relatedMovements > 0) {
            return NextResponse.json(
                { error: "Bu müşteriye bağlı ameliyat veya stok kayıtları var. Önce ilişkili kayıtları silin veya müşteriyi pasif yapın." },
                { status: 400 }
            );
        }

        await prisma.customer.delete({ where: { id } });

        return NextResponse.json({ message: "Müşteri başarıyla silindi." });
    } catch (error: any) {
        console.error("Müşteri silinirken hata:", error);
        return NextResponse.json({ error: "Müşteri silinemedi." }, { status: 500 });
    }
}
