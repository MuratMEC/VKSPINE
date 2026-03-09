"use client";

import { useState } from 'react';
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
    AlarmClock
} from 'lucide-react';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh(); // Zorla yenile ki middleware oturum yokluğunu anlasın
        } catch (error) {
            console.error("Çıkış yapılırken hata oluştu", error);
        }
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Ürün Yönetimi', icon: Package, path: '/urunler' },
        {
            name: 'Stok',
            icon: ListOrdered,
            path: '/stok',
            isGroup: true,
            subItems: [
                { name: 'Depo', path: '/stok' },
                { name: 'Stok Giriş', path: '/stok/giris' },
                { name: 'Stok Çıkış', path: '/stok/cikis' },
                { name: 'Stok Hareketleri', path: '/stok/hareketler' }
            ]
        },
        { name: 'Müşteriler', icon: Users, path: '/musteriler' },
        { name: 'Tedarikçiler', icon: Building2, path: '/tedarikciler' },
        { name: 'Kullanıcılar', icon: UserCog, path: '/kullanicilar' },
        { name: 'SKT Alarmları', icon: AlarmClock, path: '/skt-alarmlari' },
        { name: 'Ayarlar', icon: Settings, path: '/ayarlar' },
    ];

    return (
        <Box
            w={isOpen ? 260 : 70}
            h="100vh"
            bg="white"
            style={{
                borderRight: '1px solid #E9ECEF',
                transition: 'width 200ms ease',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Group h={64} px="md" justify={isOpen ? "space-between" : "center"} style={{ borderBottom: '1px solid #E9ECEF', flexShrink: 0 }}>
                {isOpen ? (
                    <Text fw={700} size="lg" variant="gradient" gradient={{ from: 'blue', to: 'indigo', deg: 90 }}>
                        VK Spine
                    </Text>
                ) : (
                    <Text fw={900} size="lg" c="blue.7">VK</Text>
                )}
                <ActionIcon variant="subtle" color="gray" onClick={() => setIsOpen(!isOpen)} size="lg">
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
                            <Text size="sm" fw={500} truncate>Admin Kullanıcı</Text>
                            <Text size="xs" c="dimmed" truncate>Yönetici</Text>
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
