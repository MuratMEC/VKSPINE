"use client";

import { useState, useEffect } from 'react';
import { Settings, Shield, HardDrive, Building, Plus, Download, RefreshCcw } from 'lucide-react';
import { Table, Badge, Text, Box, ScrollArea, Center, Loader } from '@mantine/core';

export default function AyarlarPage() {
    const [activeTab, setActiveTab] = useState('Veritabanı Yedeği');
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Son 50 işlemi (Log niyetine) veritabanından çek.
    const fetchLogs = async () => {
        try {
            setLogsLoading(true);
            const res = await fetch('/api/stock/movements');
            if (res.ok) {
                const data = await res.json();
                setLogs(data); // `route.ts` 200 veya daha az hareket dönüyor
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'Güvenlik (Loglar)') {
            fetchLogs();
        }
    }, [activeTab]);


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-slate-700" />
                    Sistem Ayarları
                </h1>
                <p className="text-slate-500 mt-1">Bildirim, yetkilendirme, şirket bilgileri ve takım yönetimi.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* SOL: AYAR MENÜLERİ */}
                <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-200 h-fit">
                    {[
                        { id: 'Firma Kartı', icon: Building },
                        { id: 'Güvenlik (Loglar)', icon: Shield },
                        { id: 'Veritabanı Yedeği', icon: HardDrive },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition-colors border-l-4 ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-700 border-blue-600'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" /> {tab.id}
                        </button>
                    ))}
                </div>

                {/* SAĞ: İÇERİK FORMU */}
                <div className="lg:col-span-3">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 min-h-[500px]">

                        {activeTab === 'Firma Kartı' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-lg font-bold text-slate-900 mb-6">Firma Kartı ve Genel Ayarlar</h2>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-slate-700">Firma Resmi Ünvanı</label>
                                            <input type="text" defaultValue="VK Spine Medikal San. ve Tic. Ltd. Şti." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Ana Şube Seçimi</label>
                                            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700">
                                                <option>Merkez (Marmara)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Para Birimi</label>
                                            <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700">
                                                <option>TRY (₺)</option>
                                                <option>USD ($)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                                        <button type="button" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">Değişiklikleri Kaydet</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'Veritabanı Yedeği' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h2 className="text-lg font-bold text-slate-900 mb-2">Veritabanı Yedeği (Backup)</h2>
                                <p className="text-sm text-slate-500 mb-6">Tüm ürünler, lotlar, hareketler ve müşteri loglarını içeren yerel SQLite veritabanınızın anlık bir kopyasını indirebilirsiniz.</p>

                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                            <HardDrive size={24} />
                                        </div>
                                        <div>
                                            <Text fw={600} size="md">Tam Yedek (dev.db)</Text>
                                            <Text size="xs" c="dimmed">En son güncel verileri içerir.</Text>
                                        </div>
                                    </div>

                                    <a href="/api/backup" download className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                                        <Download size={16} /> Şimdi İndir
                                    </a>
                                </div>

                                <div className="mt-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                    <Text size="sm" c="blue.9">
                                        <strong>Not:</strong> İndirdiğiniz `.db` (SQLite) dosyası tüm sistemin birebir kopyasıdır. Lütfen bu dosyayı güvenli bir klasörde, bulutta (Google Drive vb.) veya harici bir diskte muhafaza ediniz.
                                    </Text>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Güvenlik (Loglar)' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">Sistem Hareket Logları</h2>
                                    <button onClick={fetchLogs} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded hover:bg-slate-50 transition-colors">
                                        <RefreshCcw size={14} className={logsLoading ? 'animate-spin' : ''} /> Yenile
                                    </button>
                                </div>

                                {logsLoading ? (
                                    <Center h={200}><Loader color="blue" type="bars" /></Center>
                                ) : (
                                    <ScrollArea h={400} type="always" offsetScrollbars>
                                        <Table striped highlightOnHover>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>Tarih</Table.Th>
                                                    <Table.Th>İşlem Tipi</Table.Th>
                                                    <Table.Th>Ürün</Table.Th>
                                                    <Table.Th>Lot</Table.Th>
                                                    <Table.Th>Miktar</Table.Th>
                                                    <Table.Th>Açıklama / Hedef</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {logs.map((log) => (
                                                    <Table.Tr key={log.id}>
                                                        <Table.Td>
                                                            <Text size="xs" c="dimmed">
                                                                {new Date(log.createdAt).toLocaleString('tr-TR')}
                                                            </Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Badge color={log.type === 'IN' ? 'teal' : 'indigo'} variant="light">
                                                                {log.type === 'IN' ? 'GİRİŞ' : 'ÇIKIŞ'}
                                                            </Badge>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="sm" fw={500} lineClamp={1} w={150} title={log.product?.name}>{log.product?.name}</Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="xs" ff="monospace">{log.lot?.lotNo}</Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="sm" fw={600} c={log.type === 'IN' ? 'teal.7' : 'indigo.7'}>
                                                                {log.type === 'IN' ? '+' : '-'}{log.quantity}
                                                            </Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="xs" c="dimmed" lineClamp={2} w={200} title={log.notes || log.customer?.name}>
                                                                {log.type === 'OUT' && log.customer ? `[Teslim: ${log.customer.name}] ` : ''}
                                                                {log.notes || '-'}
                                                            </Text>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    </ScrollArea>
                                )}
                            </div>
                        )}

                        {/* Taslak Kalan Modüller */}
                        {activeTab !== 'Firma Kartı' && activeTab !== 'Güvenlik (Loglar)' && activeTab !== 'Veritabanı Yedeği' && (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <Settings className="w-12 h-12 mb-4 text-slate-300" />
                                <p>Bu sekme tasarımı ( {activeTab} ) projenin ilerleyen aşamalarında aktif edilecektir.</p>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
