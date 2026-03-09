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
    showRecent: true
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

  const { stats, charts, expiringList } = data;

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

          <Card padding="lg" radius="md">
            <Group justify="space-between" align="flex-start" mb="sm">
              <Box>
                <Text size="sm" fw={600} c="dimmed">Aktif Kurumlar</Text>
                <Title order={3} fw={700} mt="xs">{stats.hospitals}</Title>
              </Box>
              <ThemeIcon color="orange.1" c="orange.6" size="xl" radius="md">
                <Building2 size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>
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
                tooltipProps={{
                  contentStyle: { backgroundColor: '#1A202C', border: 'none', borderRadius: '8px', color: '#fff' },
                  itemStyle: { color: '#fff' }
                }}
              />
            ) : (
              <Center h={250}><Text c="dimmed">Yeterli stok çıkış verisi yok.</Text></Center>
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
              <Center h={250}><Text c="dimmed">Haftalık veri bulunamadı.</Text></Center>
            )}
          </Card>
        </SimpleGrid>
      )}

      {/* ALT BÖLÜM: YAKLAŞAN SKT VE AMELIYATLAR */}
      {((prefs.showExpiring || prefs.showRecent) &&
        <SimpleGrid cols={{ base: 1, lg: (prefs.showExpiring && prefs.showRecent) ? 3 : 1 }} spacing="md">
          {prefs.showExpiring && (
            <Card padding={0} radius="md" style={{ gridColumn: (prefs.showExpiring && prefs.showRecent) ? 'lg / span 2' : 'auto' }}>
              <Group justify="space-between" p="md" bg="gray.0" style={{ borderBottom: '1px solid #E9ECEF' }}>
                <Group gap="sm">
                  <Clock size={20} color="var(--mantine-color-orange-5)" />
                  <Text fw={700}>Yaklaşan Son Kullanım Tarihleri (SKT)</Text>
                </Group>
                <Anchor component={Link} href="#" size="sm" fw={500} display="flex" style={{ alignItems: 'center', gap: 4 }}>
                  Tümünü Gör <ChevronRight size={14} />
                </Anchor>
              </Group>

              <Table verticalSpacing="sm" horizontalSpacing="md" striped="even">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ürün Adı & Kodu</Table.Th>
                    <Table.Th>Lot Numarası</Table.Th>
                    <Table.Th>Kalan Miktar</Table.Th>
                    <Table.Th ta="right">SKT Tarihi</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {expiringList.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={4} align="center" py="xl">
                        <Text c="dimmed">90 günden az SKT'si kalmış ürün bulunmamaktadır.</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    expiringList.map((lot: any) => (
                      <Table.Tr key={lot.id}>
                        <Table.Td>
                          <Text fw={500} size="sm">{lot.productName}</Text>
                          <Text size="xs" c="dimmed">{lot.uts}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="default" radius="sm" ff="monospace">{lot.lotNo}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500} size="sm">{lot.quantity} Birim</Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Badge color={lot.daysLeft < 30 ? "red" : "orange"} variant="light" size="lg" radius="xl">
                            {lot.daysLeft} Gün Kaldı
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Card>
          )}

          {prefs.showRecent && (
            <Card padding={0} radius="md" style={{ display: 'flex', flexDirection: 'column' }}>
              <Group p="md" bg="gray.0" style={{ borderBottom: '1px solid #E9ECEF' }}>
                <Users size={20} color="var(--mantine-color-indigo-5)" />
                <Text fw={700}>Son İşlemler</Text>
              </Group>

              <Box p="md" flex={1}>
                <Timeline active={0} bulletSize={20} lineWidth={2} color="indigo">
                  <Timeline.Item title="Stok Hareketi" bullet={<Box w={8} h={8} bg="white" style={{ borderRadius: '50%' }} />}>
                    <Text c="dimmed" size="sm">Bugün itibariyle veri akışı bekleniyor.</Text>
                    <Text size="xs" mt={4} c="dimmed" tt="uppercase" fw={600}>{format(new Date(), 'dd MMM, HH:mm', { locale: tr })}</Text>
                  </Timeline.Item>
                </Timeline>
              </Box>

              <Box p="sm" bg="gray.0" style={{ borderTop: '1px solid #E9ECEF', textAlign: 'center' }}>
                <Anchor component={Link} href="/stok/hareketler" size="sm" fw={600}>
                  Tüm Hareketleri Görüntüle
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
        </Stack>
      </Drawer>
    </Box>
  );
}
