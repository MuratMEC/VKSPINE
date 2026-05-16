import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const devices = await prisma.device.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(devices);
    } catch (error) {
        return NextResponse.json({ error: 'Cihaz listesi alınamadı' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, serialNo, brand, model } = body;

        if (!name || !serialNo) {
            return NextResponse.json({ error: 'Cihaz adı ve Seri No zorunludur' }, { status: 400 });
        }

        // Seri numarası benzersiz olmalı
        const existing = await prisma.device.findUnique({ where: { serialNo } });
        if (existing) {
            return NextResponse.json({ error: 'Bu seri numarasına sahip bir cihaz zaten kayıtlı' }, { status: 400 });
        }

        const device = await prisma.device.create({
            data: { name, serialNo, brand, model }
        });

        return NextResponse.json(device);
    } catch (error) {
        return NextResponse.json({ error: 'Cihaz oluşturulamadı' }, { status: 500 });
    }
}
