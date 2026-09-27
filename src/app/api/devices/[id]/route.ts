import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const { name, serialNo, brand, model, status } = body;

        const updated = await prisma.device.update({
            where: { id: id },
            data: { name, serialNo, brand, model, status }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        await prisma.device.delete({
            where: { id: id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Silme başarısız (Cihaz ameliyat kayıtlarında olabilir)' }, { status: 500 });
    }
}
