"use client";

import { useState, useEffect } from 'react';
import { Title, Text, Group, Card, Table, Badge, ActionIcon, Menu, LoadingOverlay, Progress, Box } from '@mantine/core';
import { AlarmClock, AlertCircle, AlertTriangle, Info, MoreVertical, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type AlarmItem = {
    id: string;
    productId: string;
    productName: string;
    sku: string | null;
    brand: string | null;
    category: string | null;
    lotNo: string;
    quantity: number;
    expDate: string;
    daysLeft: number;
};

export default function SKTAlarmlariPage() {
    const [loading, setLoading] = useState(true);
    const [alarms, setAlarms] = useState<{
        summary: { expiredCount: number; criticalCount: number; warningCount: number };
        expired: AlarmItem[];
        critical: AlarmItem[];
        warning: AlarmItem[];
    }>({
        summary: { expiredCount: 0, criticalCount: 0, warningCount: 0 },
        expired: [],
        critical: [],
        warning: []
    });

    useEffect(() => {
        const fetchAlarms = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/stock/alarms');
                if (res.ok) {
                    const data = await res.json();
                    setAlarms(data);
                }
            } catch (error) {
                console.error("Alarmlar yüklenirken hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlarms();
    }, []);

    const totalRisky = alarms.summary.expiredCount + alarms.summary.criticalCount + alarms.summary.warningCount;

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Group justify="space-between" mb="xl">
                <div>
                    <Group gap="sm">
                        <AlarmClock size={28} className="text-rose-600" />
                        <Title order={2} fw={800} c="dark.9">SKT (Miad) Alarmları</Title>
                    </Group>
                    <Text c="dimmed" mt="xs">Son kullanma tarihi yaklaşan veya geçmiş ürün stokları.</Text>
                </div>
            </Group>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Expired Stats */}
                <Card withBorder radius="md" p="md" className="bg-rose-50 border-rose-200">
                    <Group justify="space-between" align="flex-start">
                        <div>
                            <Text c="rose.9" fw={700} size="xs" tt="uppercase">SKT GEÇMİŞ (!)</Text>
                            <Text fw={900} size="h2" c="rose.7">{alarms.summary.expiredCount}</Text>
                        </div>
                        <AlertCircle size={24} className="text-rose-600" />
                    </Group>
                    <Text c="rose.8" size="sm" mt="sm">Kullanımı / satışı derhal durdurulmalı</Text>
                </Card>

                {/* Critical Stats */}
                <Card withBorder radius="md" p="md" className="bg-orange-50 border-orange-200">
                    <Group justify="space-between" align="flex-start">
                        <div>
                            <Text c="orange.9" fw={700} size="xs" tt="uppercase">ÇOK KRİTİK ({`<30`} GÜN)</Text>
                            <Text fw={900} size="h2" c="orange.7">{alarms.summary.criticalCount}</Text>
                        </div>
                        <AlertTriangle size={24} className="text-orange-600" />
                    </Group>
                    <Text c="orange.8" size="sm" mt="sm">Ameliyatlarda öncelikli kullanılmalı</Text>
                </Card>

                {/* Warning Stats */}
                <Card withBorder radius="md" p="md" className="bg-yellow-50 border-yellow-200">
                    <Group justify="space-between" align="flex-start">
                        <div>
                            <Text c="yellow.9" fw={700} size="xs" tt="uppercase">DİKKAT (30-90 GÜN)</Text>
                            <Text fw={900} size="h2" c="yellow.7">{alarms.summary.warningCount}</Text>
                        </div>
                        <Info size={24} className="text-yellow-600" />
                    </Group>
                    <Text c="yellow.8" size="sm" mt="sm">Yakın planda tüketilmeli, FEFO</Text>
                </Card>
            </div>

            <Card withBorder shadow="sm" radius="md" p={0} pos="relative" style={{ minHeight: 400 }}>
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                <div className="overflow-x-auto">
                    <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
                        <Table.Thead className="bg-slate-50 border-b border-slate-200">
                            <Table.Tr>
                                <Table.Th>Durum</Table.Th>
                                <Table.Th>Ürün Adı</Table.Th>
                                <Table.Th>Seri / Lot No</Table.Th>
                                <Table.Th>Kalan Stok</Table.Th>
                                <Table.Th>Son Kullanma Tarihi</Table.Th>
                                <Table.Th w={80}></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {/* SKT GEÇMİŞ (KIRMIZI) */}
                            {alarms.expired.map((item) => (
                                <Table.Tr key={item.id} className="bg-rose-50/30">
                                    <Table.Td>
                                        <Badge color="red" variant="filled">GEÇTİ</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fw={600}>{item.productName}</Text>
                                        {(item.sku || item.brand) && (
                                            <Text size="xs" c="dimmed">{item.brand} {item.sku ? `• ${item.sku}` : ''}</Text>
                                        )}
                                    </Table.Td>
                                    <Table.Td fw={500} className="font-mono text-sm">{item.lotNo}</Table.Td>
                                    <Table.Td>
                                        <Badge color="red" variant="light">{item.quantity} Adet</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text c="red" fw={600}>{new Date(item.expDate).toLocaleDateString('tr-TR')}</Text>
                                        <Text size="xs" c="red.7">{Math.abs(item.daysLeft)} gün geçti</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon variant="light" color="blue" title="Ürün Kartını Gör" component={Link} href={`/urunler/${item.productId}`}>
                                            <Eye size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}

                            {/* KRİTİK (TURUNCU) */}
                            {alarms.critical.map((item) => (
                                <Table.Tr key={item.id} className="bg-orange-50/30">
                                    <Table.Td>
                                        <Badge color="orange" variant="filled">KRİTİK</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fw={600}>{item.productName}</Text>
                                        {(item.sku || item.brand) && (
                                            <Text size="xs" c="dimmed">{item.brand} {item.sku ? `• ${item.sku}` : ''}</Text>
                                        )}
                                    </Table.Td>
                                    <Table.Td fw={500} className="font-mono text-sm">{item.lotNo}</Table.Td>
                                    <Table.Td>
                                        <Badge color="orange" variant="light">{item.quantity} Adet</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text c="orange.7" fw={600}>{new Date(item.expDate).toLocaleDateString('tr-TR')}</Text>
                                        <Text size="xs" c="orange.7">{item.daysLeft} gün kaldı</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon variant="light" color="blue" title="Ürün Kartını Gör" component={Link} href={`/urunler/${item.productId}`}>
                                            <Eye size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}

                            {/* UYARI (SARI) */}
                            {alarms.warning.map((item) => (
                                <Table.Tr key={item.id}>
                                    <Table.Td>
                                        <Badge color="yellow" variant="light">DİKKAT</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text fw={600}>{item.productName}</Text>
                                        {(item.sku || item.brand) && (
                                            <Text size="xs" c="dimmed">{item.brand} {item.sku ? `• ${item.sku}` : ''}</Text>
                                        )}
                                    </Table.Td>
                                    <Table.Td fw={500} className="font-mono text-sm">{item.lotNo}</Table.Td>
                                    <Table.Td>
                                        <Badge color="gray" variant="light">{item.quantity} Adet</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text c="yellow.8" fw={500}>{new Date(item.expDate).toLocaleDateString('tr-TR')}</Text>
                                        <Text size="xs" c="yellow.8">{item.daysLeft} gün kaldı</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon variant="light" color="blue" title="Ürün Kartını Gör" component={Link} href={`/urunler/${item.productId}`}>
                                            <Eye size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}

                            {!loading && totalRisky === 0 && (
                                <Table.Tr>
                                    <Table.Td colSpan={6}>
                                        <Box py={40} ta="center">
                                            <CheckCircle size={40} className="text-teal-400 mx-auto mb-3" />
                                            <Text fw={600} size="lg" c="slate.7">Harika!</Text>
                                            <Text c="slate.5">Sonda kullanma tarihi yaklaşan veya geciken stok bulunmuyor.</Text>
                                        </Box>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
