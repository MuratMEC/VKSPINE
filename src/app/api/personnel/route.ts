import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const personnel = await prisma.personnel.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(personnel);
    } catch (error) {
        return NextResponse.json({ error: 'Personel listesi alınamadı' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, email, role } = body;

        if (!name) {
            return NextResponse.json({ error: 'İsim alanı zorunludur' }, { status: 400 });
        }

        const personnel = await prisma.personnel.create({
            data: { name, phone, email, role }
        });

        return NextResponse.json(personnel);
    } catch (error) {
        return NextResponse.json({ error: 'Personel oluşturulamadı' }, { status: 500 });
    }
}
