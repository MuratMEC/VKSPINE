import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const surgeries = await prisma.surgery.findMany({
            where: status ? { status } : undefined,
            include: {
                customer: true,
                personnel: true,
                devices: true,
                surgeryLines: {
                    include: {
                        lotSerial: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
            orderBy: { surgeryDate: 'desc' }
        });

        return NextResponse.json(surgeries);
    } catch (error) {
        console.error('Ameliyat listesi hatası:', error);
        return NextResponse.json({ error: 'Liste alınamadı' }, { status: 500 });
    }
}
