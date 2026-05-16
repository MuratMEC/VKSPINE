"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Title, Text, Group, Button, SimpleGrid, Card, ThemeIcon,
  Badge, Box, Table, Timeline, Anchor, Loader, Center, Drawer, Switch, ActionIcon, Stack
} from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import {
  Package, Activity, AlertTriangle, Clock,
  ChevronRight, Users, Building2, TrendingUp, Settings2
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pano özelleştirme state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    showStats: true,
    showCharts: true,
    showExpiring: true,
    showRecent: true,
    showOperations: true
  });

  useEffect(() => {
    // Tarayıcıdan ayarları yükle
    const saved = localStorage.getItem('dashboardPrefs');
    if (saved) {
      try {
        setPrefs(JSON.parse(saved));
      } catch (e) {
        console.error("Özelleştirme ayarları okunamadı:", e);
      }
    }
    fetchStats();
  }, []);

  const togglePref = (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    localStorage.setItem('dashboardPrefs', JSON.stringify(newPrefs));
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Center h="70vh" style={{ flexDirection: 'column', gap: '1rem' }}>
        <Loader color="blue" type="bars" />
        <Text c="dimmed">Dashboard verileri hazırlanıyor...</Text>
      </Center>
    );
  }

  const { stats, charts, expiringList, recentMovements, todaySurgeries } = data;

  return (
    <Box>
      <Group justify="space-between" align="flex-end" mb="lg">
        <Box>
          <Title order={2} fw={800} c="dark.9">Genel Bakış</Title>
          <Text c="dimmed" fw={500}>Güncel cerrahi stok, ameliyatlar ve kritik tarihler.</Text>
        </Box>
        <Group>
          <ActionIcon
            variant="default"
            size="lg"
            radius="md"
            onClick={() => setDrawerOpen(true)}
            title="Panoyu Özelleştir"
          >
            <Settings2 size={18} />
          </ActionIcon>
          <Button component={Link} href="/musteriler/yeni" variant="default" radius="md">
            Yeni Müşteri/Hastane Ekle
          </Button>
          <Button component={Link} href="/stok/giris" radius="md" leftSection={<Package size={16} />}>
            Stok Girişi
          </Button>
        </Group>
      </Group>

      {/* İSTATİSTİK KARTLARI (BENTO GRID) */}
      {prefs.showStats && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
          <Card padding="lg" radius="md">
            <Group justify="space-between" align="flex-start" mb="sm">
              <Box>
                <Text size="sm" fw={600} c="dimmed">Aktif Lot Sayısı</Text>
                <Title order={3} fw={700} mt="xs">{stats.activeLots}</Title>
              </Box>
              <ThemeIcon color="blue.1" c="blue.7" size="xl" radius="md">
                <Package size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card component={Link} href="/skt-alarmlari" padding="lg" radius="md" style={{ cursor: 'pointer', transition: 'transform 150ms ease, box-shadow 150ms ease' }} className="hover:shadow-md hover:-translate-y-1">
            <Group justify="space-between" align="flex-start" mb="sm">
              <Box>
                <Text size="sm" fw={600} c="dimmed">Kritik SKT Alarmı</Text>
                <Title order={3} fw={700} mt="xs" c={stats.criticalExpiring > 0 ? "red.6" : "dark.9"}>{stats.criticalExpiring}</Title>
              </Box>
              <ThemeIcon color={stats.criticalExpiring > 0 ? "red.1" : "gray.1"} c={stats.criticalExpiring > 0 ? "red.6" : "gray.6"} size="xl" radius="md">
                <AlertTriangle size={24} />
              </ThemeIcon>
            </Group>
            <Group gap="xs" mt="md">
              <Text size="sm" fw={500} c={stats.criticalExpiring > 0 ? "red.6" : "dimmed"}>90 Günden Az</Text>
              <Text size="sm" c="dimmed">Kaldı</Text>
            </Group>
          </Card>

          <Card padding="lg" radius="md">
            <Group justify="space-between" align="flex-start" mb="sm">
              <Box>
                <Text size="sm" fw={600} c="dimmed">Ameliyat (Bu Ay)</Text>
                <Title order={3} fw={700} mt="xs">{stats.surgeriesThisMonth}</Title>
              </Box>
              <ThemeIcon color="indigo.1" c="indigo.6" size="xl" radius="md">
                <Activity size={24} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card padding="lg" radius="md" component={Link} href="/ameliyatlar" style={{ cursor: 'pointer' }}>
            <Group justify="space-between" align="flex-start" mb="sm">
              <Box>
                <Text size="sm" fw={600} c="dimmed">Günün Ameliyatları</Text>
                <Title order={3} fw={700} mt="xs">{stats.todaySurgeriesCount}</Title>
              </Box>
              <ThemeIcon color="rose.1" c="rose.6" size="xl" radius="md">
                <Activity size={24} />
              </ThemeIcon>
            </Group>
            <Text size="xs" c="dimmed" mt="xs">Bugün planlanan toplam vaka</Text>
          </Card>

          <Card padding="lg" radius="md" component={Link} href="/ameliyatlar" style={{ cursor: 'pointer' }}>
            <Group justify="space-between" align="flex-start" mb="sm">
              <Box>
                <Text size="sm" fw={600} c="dimmed">Sahadaki Ekip</Text>
                <Title order={3} fw={700} mt="xs">{stats.busyPersonnel}</Title>
              </Box>
              <ThemeIcon color="blue.1" c="blue.6" size="xl" radius="md">
                <Users size={24} />
              </ThemeIcon>
            </Group>
            <Text size="xs" c="dimmed" mt="xs">Şu an aktif görevdeki personel</Text>
          </Card>
        </SimpleGrid>
      )}

      {/* GÜNÜN OPERASYONLARI VE SAHA DURUMU */}
      {prefs.showOperations && (
        <Card padding={0} radius="md" mb="lg">
            <Group justify="space-between" p="md" bg="rose.0" style={{ borderBottom: '1px solid #FFE4E6' }}>
                <Group gap="sm">
                    <Activity size={20} color="var(--mantine-color-rose-6)" />
                    <Text fw={700} c="rose.9">Günün Operasyonları ve Saha Durumu</Text>
                </Group>
                <Anchor component={Link} href="/ameliyatlar" size="sm" fw={600} c="rose.7">
                    Tüm Planı Gör
                </Anchor>
            </Group>
            <Box p="md">
                {todaySurgeries && todaySurgeries.length > 0 ? (
                    <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                        {todaySurgeries.map((s: any) => (
                            <Box key={s.id} p="sm" style={{ border: '1px solid #F1F5F9', borderRadius: '12px', backgroundColor: '#F8FAFC' }}>
                                <Group justify="space-between" mb="xs">
                                    <Text fw={700} size="sm">Dr. {s.doctor}</Text>
                                    <Badge size="xs" color="rose">BUGÜN</Badge>
                                </Group>
                                <Group gap="xs" mb="xs">
                                    <Building2 size={12} color="#64748B" />
                                    <Text size="xs" c="slate.7" fw={500}>{s.hospital}</Text>
                                </Group>
                                <Stack gap={4}>
                                    <Group gap="xs">
                                        <Users size={12} color="#3B82F6" />
                                        <Text size="xs" c="blue.7" fw={600}>{s.personnel.join(', ') || 'Ekip atanmamış'}</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <Settings2 size={12} color="#6366F1" />
                                        <Text size="xs" c="indigo.7" fw={600}>{s.devices.join(', ') || 'Cihaz atanmamış'}</Text>
                                    </Group>
                                </Stack>
                            </Box>
                        ))}
                    </SimpleGrid>
                ) : (
                    <Center py="xl">
                        <Text c="dimmed" size="sm" italic>Bugün için henüz planlanmış bir operasyon kaydı bulunmuyor.</Text>
                    </Center>
                )}
            </Box>
        </Card>
      )}

      {/* GRAFİKLER BÖLÜMÜ */}
      {prefs.showCharts && (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="lg">
          <Card padding="lg" radius="md">
            <Group gap="sm" mb="lg">
              <TrendingUp size={20} color="var(--mantine-color-blue-6)" />
              <Text fw={700}>En Çok Çıkarılan 5 Ürün (Son 30 Gün)</Text>
            </Group>
            {charts.topProducts && charts.topProducts.length > 0 ? (
              <BarChart
                h={250}
                data={charts.topProducts}
                dataKey="name"
                series={[{ name: 'miktar', color: 'blue.6' }]}
                tickLine="y"
                barProps={{ 
                  activeBar: { fill: 'var(--mantine-color-blue-4)' } 
                }}
                tooltipProps={{
                  contentStyle: { backgroundColor: '#1A202C', border: 'none', borderRadius: '8px', color: '#fff' },
                  itemStyle: { color: '#fff' }
                }}
              />
            ) : (
              <Center h={250}>
                <Stack align="center" gap="xs">
                  <ThemeIcon size="xl" radius="xl" variant="light" color="gray">
                    <TrendingUp size={24} color="var(--mantine-color-gray-5)" />
                  </ThemeIcon>
                  <Text c="dimmed" size="sm" fw={500}>Yeterli stok çıkış verisi yok.</Text>
                </Stack>
              </Center>
            )}
          </Card>

          <Card padding="lg" radius="md">
            <Group gap="sm" mb="lg">
              <Activity size={20} color="var(--mantine-color-indigo-6)" />
              <Text fw={700}>Haftalık Stok Aktivitesi (7 Gün)</Text>
            </Group>
            {charts.weeklyStats && charts.weeklyStats.length > 0 ? (
              <AreaChart
                h={250}
                data={charts.weeklyStats}
                dataKey="date"
                series={[
                  { name: 'Giriş', color: 'teal.6' },
                  { name: 'Çıkış', color: 'indigo.6' }
                ]}
                curveType="natural"
                withDots={false}
                tickLine="x"
              />
            ) : (
              <Center h={250}>
                <Stack align="center" gap="xs">
                  <ThemeIcon size="xl" radius="xl" variant="light" color="gray">
                    <Activity size={24} color="var(--mantine-color-gray-5)" />
                  </ThemeIcon>
                  <Text c="dimmed" size="sm" fw={500}>Haftalık veri bulunamadı.</Text>
                </Stack>
              </Center>
            )}
          </Card>
        </SimpleGrid>
      )}

      {/* ALT BÖLÜM: YAKLAŞAN SKT VE SON İŞLEMLER */}
      {((prefs.showExpiring || prefs.showRecent) &&
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          {prefs.showExpiring && (
            <Card padding={0} radius="md" shadow="sm" style={{ border: '1px solid #E2E8F0' }}>
              <Group justify="space-between" p="md" bg="gray.0" style={{ borderBottom: '1px solid #E2E8F0' }}>
                <Group gap="sm">
                  <Clock size={20} color="var(--mantine-color-orange-5)" />
                  <Text fw={700}>Yaklaşan SKT Alarmları</Text>
                </Group>
                <Anchor component={Link} href="/skt-alarmlari" size="sm" fw={600}>
                  Tümünü Gör
                </Anchor>
              </Group>

              <Box style={{ overflowX: 'auto' }}>
                <Table verticalSpacing="sm" horizontalSpacing="md" striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Ürün</Table.Th>
                      <Table.Th>Lot</Table.Th>
                      <Table.Th ta="right">Durum</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {expiringList.length === 0 ? (
                      <Table.Tr><Table.Td colSpan={3} align="center" py="xl"><Text c="dimmed">Kritik ürün yok.</Text></Table.Td></Table.Tr>
                    ) : (
                      expiringList.map((lot: any) => (
                        <Table.Tr key={lot.id}>
                          <Table.Td>
                            <Text fw={600} size="sm" truncate maxWidth={200}>{lot.productName}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="outline" color="gray" size="xs">{lot.lotNo}</Badge>
                          </Table.Td>
                          <Table.Td ta="right">
                            <Badge color={lot.daysLeft < 30 ? "red" : "orange"} variant="light" radius="xl">
                              {lot.daysLeft} Gün
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </Box>
            </Card>
          )}

          {prefs.showRecent && (
            <Card padding={0} radius="md" shadow="sm" style={{ border: '1px solid #E2E8F0' }}>
              <Group p="md" bg="gray.0" style={{ borderBottom: '1px solid #E2E8F0' }}>
                <Activity size={20} color="var(--mantine-color-indigo-5)" />
                <Text fw={700}>Son Stok Hareketleri</Text>
              </Group>

              <Box style={{ overflowX: 'auto' }}>
                <Table verticalSpacing="sm" horizontalSpacing="md" striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>İşlem</Table.Th>
                      <Table.Th>Ürün</Table.Th>
                      <Table.Th ta="right">Tarih</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {recentMovements.length === 0 ? (
                      <Table.Tr><Table.Td colSpan={3} align="center" py="xl"><Text c="dimmed">Hareket yok.</Text></Table.Td></Table.Tr>
                    ) : (
                      recentMovements.map((mov: any) => (
                        <Table.Tr key={mov.id}>
                          <Table.Td>
                            <Badge color={mov.type === 'IN' ? 'teal' : 'rose'} variant="light" size="sm">
                              {mov.type === 'IN' ? 'GİRİŞ' : 'ÇIKIŞ'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text fw={500} size="sm" truncate maxWidth={180}>{mov.productName}</Text>
                            <Text size="xs" c="dimmed">{mov.quantity} Adet {mov.target ? `• ${mov.target}` : ''}</Text>
                          </Table.Td>
                          <Table.Td ta="right">
                            <Text size="xs" fw={600} c="dimmed">
                              {format(new Date(mov.createdAt), 'dd MMM', { locale: tr })}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </Box>
              <Box p="xs" style={{ textAlign: 'center', borderTop: '1px solid #F1F5F9' }}>
                <Anchor component={Link} href="/stok/hareketler" size="xs" fw={700}>
                  TÜMÜNÜ GÖRÜNTÜLE
                </Anchor>
              </Box>
            </Card>
          )}
        </SimpleGrid>
      )}

      {/* ÖZELLEŞTİRME DRAWER'I */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Panoyu Özelleştir"
        position="right"
        overlayProps={{ opacity: 0.5, blur: 4 }}
      >
        <Text c="dimmed" size="sm" mb="xl">
          Dashboard ekranında hangi alanların gösterileceğini seçebilirsiniz. Seçimleriniz tarayıcınıza kaydedilir.
        </Text>

        <Stack gap="md">
          <Switch
            label="Özet İstatistikler"
            description="Aktif lot, kritik uyarılar ve genel sayılar"
            checked={prefs.showStats}
            onChange={() => togglePref('showStats')}
          />
          <Switch
            label="Analiz Grafikleri"
            description="En çok giden ürünler ve haftalık aktivite grafikleri"
            checked={prefs.showCharts}
            onChange={() => togglePref('showCharts')}
          />
          <Switch
            label="Yaklaşan Son Kullanım Tarihleri"
            description="SKT'si 90 günden az kalmış kritik ürünler listesi"
            checked={prefs.showExpiring}
            onChange={() => togglePref('showExpiring')}
          />
          <Switch
            label="Son İşlemler (Zaman Çizelgesi)"
            description="Sisteme işlenen son stok ve ameliyat hareketleri"
            checked={prefs.showRecent}
            onChange={() => togglePref('showRecent')}
          />
          <Switch
            label="Günün Operasyonları"
            description="Bugün planlanan ameliyatlar ve saha ekipleri"
            checked={prefs.showOperations}
            onChange={() => togglePref('showOperations')}
          />
        </Stack>
      </Drawer>
    </Box>
  );
}
