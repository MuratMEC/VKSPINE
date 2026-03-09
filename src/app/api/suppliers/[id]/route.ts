import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tek bir tedarikçiyi getir (GET)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supplier = await prisma.supplier.findUnique({ where: { id } });

        if (!supplier) {
            return NextResponse.json({ error: "Tedarikçi bulunamadı." }, { status: 404 });
        }

        return NextResponse.json(supplier);
    } catch (error: any) {
        console.error("Tedarikçi getirilirken hata:", error);
        return NextResponse.json({ error: "Tedarikçi alınamadı." }, { status: 500 });
    }
}

// Tek bir tedarikçiyi güncelle (PUT)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { companyName, taxOffice, taxNumber, contactPerson, phone, email, address, notes, isActive } = body;

        if (!companyName || companyName.trim() === '') {
            return NextResponse.json({ error: "Firma adı zorunludur." }, { status: 400 });
        }

        const updatedSupplier = await prisma.supplier.update({
            where: { id },
            data: {
                companyName: companyName.trim(),
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

        return NextResponse.json(updatedSupplier);
    } catch (error: any) {
        console.error("Tedarikçi güncellenirken hata:", error);
        return NextResponse.json({ error: "Tedarikçi güncellenemedi." }, { status: 500 });
    }
}

// Tek bir tedarikçiyi sil (DELETE)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Tedarikçiye bağlı lot/stok hareketi var mı kontrol et
        const relatedLots = await prisma.lotSerial.count({ where: { supplierId: id } });
        const relatedMovements = await prisma.stockMovement.count({ where: { supplierId: id } });

        if (relatedLots > 0 || relatedMovements > 0) {
            return NextResponse.json(
                { error: "Bu tedarikçiye bağlı stok kayıtları var. Önce ilişkili kayıtları silin veya tedarikçiyi pasif yapın." },
                { status: 400 }
            );
        }

        await prisma.supplier.delete({ where: { id } });

        return NextResponse.json({ message: "Tedarikçi başarıyla silindi." });
    } catch (error: any) {
        console.error("Tedarikçi silinirken hata:", error);
        return NextResponse.json({ error: "Tedarikçi silinemedi." }, { status: 500 });
    }
}
