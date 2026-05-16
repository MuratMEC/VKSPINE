import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { 
            doctorName, 
            patientName, 
            surgeryDate, 
            hospitalName, 
            city, 
            personnelIds, 
            deviceIds,
            status 
        } = body;

        const updated = await prisma.surgery.update({
            where: { id: params.id },
            data: {
                doctorName,
                patientName,
                surgeryDate: surgeryDate ? new Date(surgeryDate) : undefined,
                hospitalName,
                city,
                status,
                // İlişkileri güncelle
                personnel: personnelIds ? {
                    set: personnelIds.map((id: string) => ({ id }))
                } : undefined,
                devices: deviceIds ? {
                    set: deviceIds.map((id: string) => ({ id }))
                } : undefined,
            }
        });

        // Eğer cihazlar değiştiyse, eski cihazları AVAILABLE, yenileri BUSY yapabiliriz.
        // Ama şimdilik basit tutalım.

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Güncelleme hatası:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
