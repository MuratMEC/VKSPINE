"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Box, NavLink, ScrollArea, Group, Text, Avatar, Divider, ActionIcon, Tooltip } from '@mantine/core';
import {
    LayoutDashboard,
    Package,
    Users,
    Building2,
    Settings,
    Menu,
    ChevronLeft,
    ListOrdered,
    LogOut,
    UserCog,
    AlarmClock,
    Layers,
    UserCircle2,
    HardDrive,
    Activity,
    BarChart3
} from 'lucide-react';

export default function Sidebar({ isOpen = true, toggleDesktop }: { isOpen?: boolean, toggleDesktop?: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(() => setUser({ role: 'USER' }));
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh(); 
        } catch (error) {
            console.error("Çıkış yapılırken hata oluştu", error);
        }
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Raporlar', icon: BarChart3, path: '/raporlar' },
        
        { 
            name: 'Operasyon', 
            icon: Activity, 
            path: '/ameliyatlar',
            isGroup: true,
            subItems: [
                { name: 'Operasyon Takip', path: '/ameliyatlar' },
                { name: 'Ameliyat Setleri', path: '/ameliyat-setleri' },
                { name: 'Stok Giriş', path: '/stok/giris' },
                { name: 'Stok Çıkış', path: '/stok/cikis' },
                { name: 'Hareket Geçmişi', path: '/stok/hareketler' }
            ]
        },

        { 
            name: 'Envanter', 
            icon: Package, 
            path: '/urunler',
            isGroup: true,
            subItems: [
                { name: 'Ürün Listesi', path: '/urunler' },
                { name: 'Depo Durumu', path: '/stok' },
                { name: 'SKT Alarmları', path: '/skt-alarmlari' }
            ]
        },

        { 
            name: 'Yönetim', 
            icon: Users, 
            path: '/personel',
            isGroup: true,
            subItems: [
                { name: 'Personel', path: '/personel' },
                { name: 'Cihazlar', path: '/cihazlar' },
                { name: 'Müşteriler', path: '/musteriler' },
                { name: 'Tedarikçiler', path: '/tedarikciler' }
            ]
        },

        { 
            name: 'Sistem', 
            icon: Settings, 
            path: '/ayarlar',
            isGroup: true,
            isAdmin: true, // Sadece admin görsün
            subItems: [
                { name: 'Genel Ayarlar', path: '/ayarlar' },
                { name: 'Kullanıcılar', path: '/kullanicilar' }
            ]
        },
    ].filter(item => {
        if (item.isAdmin && user?.role !== 'ADMIN') return false;
        if (item.name === 'Raporlar' && user?.role !== 'ADMIN') return false;
        return true;
    });

    return (
        <Box
            h="100%"
            bg="white"
            style={{
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Group h={64} px="md" justify={isOpen ? "space-between" : "center"} style={{ borderBottom: '1px solid #E9ECEF', flexShrink: 0 }}>
                {isOpen ? (
                    <Text fw={700} size="lg" variant="gradient" gradient={{ from: 'blue', to: 'indigo', deg: 90 }} display={{ base: 'block', sm: 'none' }}>
                        VK Spine
                    </Text>
                ) : (
                    <Text fw={900} size="lg" c="blue.7" display={{ base: 'none', sm: 'block' }}>VK</Text>
                )}
                <ActionIcon variant="subtle" color="gray" onClick={toggleDesktop} size="lg" display={{ base: 'none', sm: 'flex' }}>
                    {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                </ActionIcon>
            </Group>

            <ScrollArea flex={1} type="auto" px="sm" py="md">
                {menuItems.map((item) => {
                    if (item.isGroup) {
                        return (
                            <NavLink
                                key={item.name}
                                label={isOpen ? item.name : undefined}
                                leftSection={<item.icon size={20} />}
                                childrenOffset={isOpen ? 28 : 0}
                                defaultOpened={pathname?.startsWith('/stok')}
                                styles={{ root: { borderRadius: 8, marginBottom: 4 } }}
                            >
                                {isOpen && item.subItems?.map((subItem) => (
                                    <NavLink
                                        key={subItem.path}
                                        component={Link}
                                        href={subItem.path}
                                        label={subItem.name}
                                        active={pathname === subItem.path}
                                        styles={{ root: { borderRadius: 8, marginTop: 2, marginBottom: 2 } }}
                                    />
                                ))}
                            </NavLink>
                        );
                    }

                    const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            component={Link}
                            href={item.path}
                            label={isOpen ? item.name : undefined}
                            leftSection={<item.icon size={20} />}
                            active={isActive}
                            styles={{ root: { borderRadius: 8, marginBottom: 4 } }}
                            title={!isOpen ? item.name : undefined}
                        />
                    );
                })}
            </ScrollArea>

            <Divider color="#E9ECEF" />

            <Box p="md" style={{ display: 'flex', flexDirection: isOpen ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between', gap: isOpen ? 0 : 12 }}>
                <Group wrap="nowrap" gap="sm">
                    <Avatar color="blue" radius="xl" size={isOpen ? "md" : "sm"}>AD</Avatar>
                    {isOpen && (
                        <Box style={{ flex: 1, minWidth: 0, maxWidth: 120 }}>
                            <Text size="sm" fw={500} truncate>{user?.username || 'Kullanıcı'}</Text>
                            <Text size="xs" c="dimmed" truncate>{user?.role === 'ADMIN' ? 'Yönetici' : 'Operatör'}</Text>
                        </Box>
                    )}
                </Group>

                <Tooltip label="Çıkış Yap" position="right" disabled={isOpen}>
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={handleLogout}
                        size="lg"
                        title="Çıkış Yap"
                    >
                        <LogOut size={18} />
                    </ActionIcon>
                </Tooltip>
            </Box>
        </Box>
    );
}
