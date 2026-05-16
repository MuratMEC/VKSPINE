import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        // 1. Örnek Personeller
        const personnelData = [
            { name: 'Ahmet Yılmaz', role: 'Teknisyen', phone: '0532 111 22 33' },
            { name: 'Mehmet Demir', role: 'Teknisyen', phone: '0533 222 33 44' },
            { name: 'Ayşe Kaya', role: 'Saha Sorumlusu', phone: '0534 333 44 55' },
            { name: 'Caner Öz', role: 'Satış Temsilcisi', phone: '0535 444 55 66' },
            { name: 'Fatma Şahin', role: 'Teknisyen', phone: '0536 555 66 77' }
        ];

        for (const p of personnelData) {
            await prisma.personnel.upsert({
                where: { id: `demo-${p.name.replace(/\s/g, '-')}` },
                update: {},
                create: { 
                    id: `demo-${p.name.replace(/\s/g, '-')}`,
                    ...p 
                }
            });
        }

        // 2. Örnek Cihazlar
        const deviceData = [
            { name: 'Medtronic Motor Seti', serialNo: 'SN-MED-001', brand: 'Medtronic', model: 'Midas Rex' },
            { name: 'K-Wire Drill Seti', serialNo: 'SN-DRL-502', brand: 'Stryker', model: 'System 7' },
            { name: 'Artrokopi Shaver', serialNo: 'SN-SHA-909', brand: 'Arthrex', model: 'Synergy' },
            { name: 'C-Kollu Skopi Cihazı', serialNo: 'SN-SKO-100', brand: 'Siemens', model: 'Cios Select' },
            { name: 'Turnike Cihazı', serialNo: 'SN-TUR-222', brand: 'Zimmer', model: 'A.T.S. 4000' }
        ];

        for (const d of deviceData) {
            await prisma.device.upsert({
                where: { serialNo: d.serialNo },
                update: {},
                create: d
            });
        }

        return NextResponse.json({ success: true, message: 'Demo veriler (5 Personel, 5 Cihaz) başarıyla yüklendi.' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
