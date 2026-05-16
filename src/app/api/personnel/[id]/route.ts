import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { name, phone, email, role, isActive } = body;

        const updated = await prisma.personnel.update({
            where: { id: params.id },
            data: { name, phone, email, role, isActive }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.personnel.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Silme başarısız (Personel ameliyat kayıtlarında olabilir)' }, { status: 500 });
    }
}
