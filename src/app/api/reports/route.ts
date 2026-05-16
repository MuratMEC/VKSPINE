import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        const dateFilter = (start && end) ? {
            surgeryDate: {
                gte: new Date(start),
                lte: new Date(end)
            }
        } : {};

        // 1. Ameliyat Verilerini Getir
        const surgeries = await prisma.surgery.findMany({
            where: dateFilter,
            include: {
                personnel: true,
                devices: true,
                customer: true
            }
        });

        // 2. Personel İstatistikleri
        const personnelMap: Record<string, { name: string, count: number, role: string }> = {};
        surgeries.forEach(s => {
            s.personnel.forEach(p => {
                if (!personnelMap[p.id]) personnelMap[p.id] = { name: p.name, count: 0, role: p.role || '' };
                personnelMap[p.id].count++;
            });
        });

        // 3. Cihaz İstatistikleri
        const deviceMap: Record<string, { name: string, count: number, serial: string }> = {};
        surgeries.forEach(s => {
            s.devices.forEach(d => {
                if (!deviceMap[d.id]) deviceMap[d.id] = { name: d.name, count: 0, serial: d.serialNo };
                deviceMap[d.id].count++;
            });
        });

        // 4. Doktor ve Hastane İstatistikleri
        const doctorMap: Record<string, number> = {};
        const hospitalMap: Record<string, number> = {};
        
        surgeries.forEach(s => {
            if (s.doctorName) doctorMap[s.doctorName] = (doctorMap[s.doctorName] || 0) + 1;
            const hName = s.hospitalName || s.customer?.name || 'Bilinmeyen';
            hospitalMap[hName] = (hospitalMap[hName] || 0) + 1;
        });

        return NextResponse.json({
            summary: {
                totalSurgeries: surgeries.length,
                personnelCount: Object.keys(personnelMap).length,
                deviceCount: Object.keys(deviceMap).length
            },
            personnelStats: Object.values(personnelMap).sort((a, b) => b.count - a.count),
            deviceStats: Object.values(deviceMap).sort((a, b) => b.count - a.count),
            doctorStats: Object.entries(doctorMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
            hospitalStats: Object.entries(hospitalMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
