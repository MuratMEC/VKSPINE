"use client";

import { useState, useEffect } from 'react';
import { Group, TextInput, ActionIcon, Indicator, Title, Box, Popover, Text, ScrollArea, Avatar, Divider, Badge, Loader, ThemeIcon } from '@mantine/core';
import { Search, BellRing, Activity, Package, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
    // Arama States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Bildirim States
    const [notifications, setNotifications] = useState<{ expiringList: any[], lowStockList: any[] }>({ expiringList: [], lowStockList: [] });
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Bildirimleri Çek
    useEffect(() => {
        fetch('/api/notifications')
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(err => console.error("Bildirim hatası:", err));
    }, []);

    const totalNotifications = (notifications.expiringList?.length || 0) + (notifications.lowStockList?.length || 0);

    // Arama Mantığı (Debounce eklenebilir, şimdilik basit timeout)
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data);
                    setIsSearchOpen(true);
                }
            } catch (error) {
                console.error("Arama hatası:", error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);


    return (
        <Box
            component="header"
            h={64}
            px="md"
            bg="white"
            style={{ borderBottom: '1px solid #E9ECEF', position: 'sticky', top: 0, zIndex: 40 }}
        >
            <Group h="100%" justify="space-between" wrap="nowrap">
                <Group display={{ base: 'flex', sm: 'none' }} wrap="nowrap">
                    <Link href="/">
                        <ActionIcon variant="gradient" gradient={{ from: 'blue', to: 'indigo', deg: 90 }} size="lg" radius="md">
                            <Activity size={20} />
                        </ActionIcon>
                    </Link>
                    <Title order={3} style={{ background: 'linear-gradient(90deg, #1d4ed8, #4338ca)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        MediStock
                    </Title>
                </Group>

                <Box display={{ base: 'none', sm: 'block' }} style={{ flex: 1 }} />

                <Group gap="md" wrap="nowrap">

                    {/* ARAMA POPOVER */}
                    <Popover opened={isSearchOpen} position="bottom-end" width={400} shadow="md" offset={4}>
                        <Popover.Target>
                            <TextInput
                                placeholder="Ürün kodu veya isim ara..."
                                leftSection={<Search size={16} />}
                                rightSection={isSearching ? <Loader size="xs" /> : null}
                                w={300}
                                radius="xl"
                                variant="filled"
                                display={{ base: 'none', md: 'block' }}
                                styles={{ input: { backgroundColor: '#F8F9FA', border: 'none' } }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)} // Tıklamaya izin ver
                            />
                        </Popover.Target>

                        <Popover.Dropdown p={0}>
                            <Box p="sm" bg="gray.0" style={{ borderBottom: '1px solid #E9ECEF' }}>
                                <Text size="xs" fw={600} c="dimmed" tt="uppercase">Arama Sonuçları</Text>
                            </Box>
                            <ScrollArea h={300}>
                                {searchResults.length === 0 ? (
                                    <Box p="md" ta="center">
                                        <Text c="dimmed" size="sm">Sonuç bulunamadı.</Text>
                                    </Box>
                                ) : (
                                    searchResults.map((prod) => (
                                        <Link key={prod.id} href="/urunler" style={{ textDecoration: 'none' }}>
                                            <Group p="sm" wrap="nowrap" style={{ borderBottom: '1px solid #f1f3f5', cursor: 'pointer' }} className="hover:bg-blue-50">
                                                <Avatar color="blue" radius="md"><Package size={16} /></Avatar>
                                                <Box flex={1}>
                                                    <Text size="sm" fw={600} c="dark.9">{prod.name}</Text>
                                                    <Text size="xs" c="dimmed">{prod.utsCode}</Text>
                                                </Box>
                                            </Group>
                                        </Link>
                                    ))
                                )}
                            </ScrollArea>
                        </Popover.Dropdown>
                    </Popover>

                    {/* BILDIRIM POPOVER */}
                    <Popover opened={isNotifOpen} onChange={setIsNotifOpen} position="bottom-end" width={320} shadow="lg" offset={8}>
                        <Popover.Target>
                            <Indicator color="red" size={10} processing disabled={totalNotifications === 0} label={totalNotifications} offset={4}>
                                <ActionIcon onClick={() => setIsNotifOpen((o) => !o)} variant="subtle" color={isNotifOpen ? "blue" : "gray"} size="lg" radius="xl">
                                    <BellRing size={20} />
                                </ActionIcon>
                            </Indicator>
                        </Popover.Target>

                        <Popover.Dropdown p={0}>
                            <Group p="md" justify="space-between" style={{ borderBottom: '1px solid #E9ECEF' }}>
                                <Text fw={700}>Bildirimler</Text>
                                <Badge color="red" variant="light">{totalNotifications} Yeni</Badge>
                            </Group>
                            <ScrollArea h={Math.max(300, 150)} mah={400}>
                                {totalNotifications === 0 ? (
                                    <Box p="xl" ta="center">
                                        <Text c="dimmed" size="sm">Yeni bildiriminiz yok.</Text>
                                    </Box>
                                ) : (
                                    <>
                                        {/* SKT BİLDİRİMLERİ */}
                                        {notifications.expiringList?.map((lot, idx) => (
                                            <Group key={`exp-${idx}`} p="sm" wrap="nowrap" style={{ borderBottom: '1px solid #f1f3f5' }}>
                                                <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                                                    <Clock size={16} />
                                                </ThemeIcon>
                                                <Box flex={1}>
                                                    <Text size="sm" fw={600}>{lot.productName}</Text>
                                                    <Text size="xs" c="dimmed">Lot: {lot.lotNo} ({lot.quantity} adet)</Text>
                                                    <Text size="xs" c="orange.7" fw={700} mt={4}>{lot.daysLeft} gün kaldı!</Text>
                                                </Box>
                                            </Group>
                                        ))}

                                        {/* DÜŞÜK STOK BİLDİRİMLERİ */}
                                        {notifications.lowStockList?.map((prod, idx) => (
                                            <Group key={`stk-${idx}`} p="sm" wrap="nowrap" style={{ borderBottom: '1px solid #f1f3f5' }}>
                                                <ThemeIcon color="red" variant="light" size="lg" radius="md">
                                                    <AlertTriangle size={16} />
                                                </ThemeIcon>
                                                <Box flex={1}>
                                                    <Text size="sm" fw={600}>{prod.name}</Text>
                                                    <Text size="xs" c="dimmed">Kritik Stok: {prod.minStockLvl} altı</Text>
                                                    <Text size="xs" c="red.7" fw={700} mt={4}>Sadece {prod.totalQuantity} adet kaldı!</Text>
                                                </Box>
                                            </Group>
                                        ))}
                                    </>
                                )}
                            </ScrollArea>
                        </Popover.Dropdown>
                    </Popover>

                </Group>
            </Group>
        </Box>
    );
}
