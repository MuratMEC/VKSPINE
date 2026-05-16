const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const user = await prisma.user.upsert({
            where: { username: 'admin' },
            update: {
                password: hashedPassword,
                role: 'ADMIN'
            },
            create: {
                username: 'admin',
                password: hashedPassword,
                name: 'Admin Kullanıcı',
                role: 'ADMIN'
            }
        });

        console.log('==========================================');
        console.log('  SIFRE SIFIRLAMA BASARILI!');
        console.log('==========================================');
        console.log('  Kullanici Adi: admin');
        console.log('  Yeni Sifre   : admin123');
        console.log('==========================================');
        console.log('Lutfen sisteme girince sifrenizi degistirin.');
        
    } catch (error) {
        console.error('Hata olustu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
