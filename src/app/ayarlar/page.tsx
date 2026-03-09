"use client";

import { useState, useEffect, useCallback } from 'react';
import { Settings, Shield, HardDrive, Building, Download, RefreshCcw, Tag, Plus, Search, Edit3, Trash2, Check, X, Loader2, AlertCircle, Layers } from 'lucide-react';
import { Table, Badge, Text, Box, ScrollArea, Center, Loader } from '@mantine/core';

interface CategoryItem {
    id: string;
    name: string;
    isActive: boolean;
    _count: { products: number };
}

export default function AyarlarPage() {
    const [activeTab, setActiveTab] = useState('Kategori Yönetimi');
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Ana Kategori State
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [isCatLoading, setIsCatLoading] = useState(false);
    const [catSearch, setCatSearch] = useState('');
    const [newCatName, setNewCatName] = useState('');
    const [addingCat, setAddingCat] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [catError, setCatError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Set Kategorisi State
    const [setCats, setSetCats] = useState<CategoryItem[]>([]);
    const [isSetCatLoading, setIsSetCatLoading] = useState(false);
    const [sCatSearch, setSCatSearch] = useState('');
    const [newSetCatName, setNewSetCatName] = useState('');
    const [addingSetCat, setAddingSetCat] = useState(false);
    const [editingSetId, setEditingSetId] = useState<string | null>(null);
    const [editSetName, setEditSetName] = useState('');

    // Log fetch
    const fetchLogs = async () => {
        try {
            setLogsLoading(true);
            const res = await fetch('/api/stock/movements');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLogsLoading(false);
        }
    };

    // Kategori fetch
    const fetchCategories = useCallback(async () => {
        try {
            setIsCatLoading(true);
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCatLoading(false);
        }
    }, []);

    // Set Kategorisi fetch
    const fetchSetCategories = useCallback(async () => {
        try {
            setIsSetCatLoading(true);
            const res = await fetch('/api/set-categories');
            if (res.ok) {
                const data = await res.json();
                setSetCats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSetCatLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'Güvenlik (Loglar)') {
            fetchLogs();
        }
        if (activeTab === 'Kategori Yönetimi') {
            fetchCategories();
        }
        if (activeTab === 'Set Kategori Yönetimi') {
            fetchSetCategories();
        }
    }, [activeTab, fetchCategories, fetchSetCategories]);

    // Kategori Ekleme
    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        setAddingCat(true);
        setCatError('');
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCatName.trim() })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Kategori eklenemedi.');
            }
            setNewCatName('');
            await fetchCategories();
        } catch (err: any) {
            setCatError(err.message);
        } finally {
            setAddingCat(false);
        }
    };

    // Kategori Güncelleme
    const handleUpdateCategory = async (id: string, type: 'category' | 'set') => {
        const name = type === 'category' ? editName.trim() : editSetName.trim();
        if (!name) return;
        setCatError('');
        const endpoint = type === 'category' ? `/api/categories/${id}` : `/api/set-categories/${id}`;

        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Güncelleme başarısız.');
            }
            if (type === 'category') {
                setEditingId(null);
                fetchCategories();
            } else {
                setEditingSetId(null);
                fetchSetCategories();
            }
        } catch (err: any) {
            setCatError(err.message);
        }
    };

    // Kategori Silme
    const handleDelete = async (id: string, name: string, type: 'category' | 'set') => {
        if (!confirm(`"${name}" kaydını silmek istediğinize emin misiniz?`)) return;
        setDeletingId(id);
        setCatError('');
        const endpoint = type === 'category' ? `/api/categories/${id}` : `/api/set-categories/${id}`;

        try {
            const res = await fetch(endpoint, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Silme işlemi başarısız.');
            }
            if (type === 'category') fetchCategories();
            else fetchSetCategories();
        } catch (err: any) {
            setCatError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    // Set Kategori Ekleme
    const handleAddSetCategory = async () => {
        if (!newSetCatName.trim()) return;
        setAddingSetCat(true);
        setCatError('');
        try {
            const res = await fetch('/api/set-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSetCatName.trim() })
            });
            if (!res.ok) throw new Error('Set Kategorisi eklenemedi.');
            setNewSetCatName('');
            fetchSetCategories();
        } catch (err: any) {
            setCatError(err.message);
        } finally {
            setAddingSetCat(false);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(catSearch.toLowerCase())
    );

    const filteredSetCats = setCats.filter(c =>
        c.name.toLowerCase().includes(sCatSearch.toLowerCase())
    );

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

                <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-200 h-fit">
                    {[
                        { id: 'Kategori Yönetimi', icon: Tag },
                        { id: 'Set Kategori Yönetimi', icon: Layers },
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

                <div className="lg:col-span-3">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 min-h-[500px]">

                        {catError && (
                            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2 text-sm animate-in fade-in">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {catError}
                                <button onClick={() => setCatError('')} className="ml-auto text-rose-500 hover:text-rose-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {activeTab === 'Kategori Yönetimi' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Ürün Kategorileri</h2>
                                        <p className="text-sm text-slate-500 mt-1">Ürün kartlarında kullanılan ana kategoriler.</p>
                                    </div>
                                    <button onClick={fetchCategories} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded hover:bg-slate-50 transition-colors">
                                        <RefreshCcw size={14} className={isCatLoading ? 'animate-spin' : ''} /> Yenile
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" placeholder="Kategori ara..." value={catSearch} onChange={(e) => setCatSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Yeni kategori adı..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]" />
                                        <button onClick={handleAddCategory} disabled={addingCat || !newCatName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm">
                                            {addingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                            Ekle
                                        </button>
                                    </div>
                                </div>

                                <CategoryTable
                                    data={filteredCategories}
                                    isLoading={isCatLoading}
                                    editingId={editingId}
                                    setEditingId={setEditingId}
                                    editName={editName}
                                    setEditName={setEditName}
                                    handleUpdate={(id) => handleUpdateCategory(id, 'category')}
                                    handleDelete={(id, name) => handleDelete(id, name, 'category')}
                                    deletingId={deletingId}
                                    icon={<Tag className="w-3.5 h-3.5 text-blue-500" />}
                                />
                            </div>
                        )}

                        {activeTab === 'Set Kategori Yönetimi' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Set Kategorileri</h2>
                                        <p className="text-sm text-slate-500 mt-1">Cihaz ve platin setlerini gruplandırmak için kullanılır.</p>
                                    </div>
                                    <button onClick={fetchSetCategories} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded hover:bg-slate-50 transition-colors">
                                        <RefreshCcw size={14} className={isSetCatLoading ? 'animate-spin' : ''} /> Yenile
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" placeholder="Set kategorisi ara..." value={sCatSearch} onChange={(e) => setSCatSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Yeni set adı..." value={newSetCatName} onChange={(e) => setNewSetCatName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddSetCategory(); }} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[200px]" />
                                        <button onClick={handleAddSetCategory} disabled={addingSetCat || !newSetCatName.trim()} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm">
                                            {addingSetCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                            Ekle
                                        </button>
                                    </div>
                                </div>

                                <CategoryTable
                                    data={filteredSetCats}
                                    isLoading={isSetCatLoading}
                                    editingId={editingSetId}
                                    setEditingId={setEditingSetId}
                                    editName={editSetName}
                                    setEditName={setEditSetName}
                                    handleUpdate={(id) => handleUpdateCategory(id, 'set')}
                                    handleDelete={(id, name) => handleDelete(id, name, 'set')}
                                    deletingId={deletingId}
                                    icon={<Layers className="w-3.5 h-3.5 text-purple-500" />}
                                />
                            </div>
                        )}

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
                                                            <Text size="xs" c="dimmed">{new Date(log.createdAt).toLocaleString('tr-TR')}</Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Badge color={log.type === 'IN' ? 'teal' : 'indigo'} variant="light">{log.type === 'IN' ? 'GİRİŞ' : 'ÇIKIŞ'}</Badge>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="sm" fw={500} lineClamp={1} w={150} title={log.product?.name}>{log.product?.name}</Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="xs" ff="monospace">{log.lot?.lotNo}</Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="sm" fw={600} c={log.type === 'IN' ? 'teal.7' : 'indigo.7'}>{log.type === 'IN' ? '+' : '-'}{log.quantity}</Text>
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

                    </div>
                </div>

            </div>
        </div>
    );
}

interface CategoryTableProps {
    data: CategoryItem[];
    isLoading: boolean;
    editingId: string | null;
    setEditingId: (id: string | null) => void;
    editName: string;
    setEditName: (name: string) => void;
    handleUpdate: (id: string) => void;
    handleDelete: (id: string, name: string) => void;
    deletingId: string | null;
    icon: React.ReactNode;
}

function CategoryTable({ 
    data, isLoading, editingId, setEditingId, editName, setEditName, 
    handleUpdate, handleDelete, deletingId, icon 
}: CategoryTableProps) {
    if (isLoading) return <Center h={200}><Loader color="blue" type="bars" /></Center>;
    if (data.length === 0) return (
        <div className="text-center py-12 text-slate-400">
            <p className="font-medium">Sonuç bulunamadı.</p>
        </div>
    );

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden animate-in fade-in duration-300">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-5 py-3 text-sm">Adı</th>
                        <th className="px-5 py-3 text-center text-sm">Bağlı Ürün</th>
                        <th className="px-5 py-3 text-right text-sm">İşlemler</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-900 capitalize">
                                {editingId === item.id ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdate(item.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            className="px-3 py-1 border border-blue-400 rounded-md outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                            autoFocus
                                        />
                                        <button onClick={() => handleUpdate(item.id)} className="p-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"><Check size={16} /></button>
                                        <button onClick={() => setEditingId(null)} className="p-1 text-slate-500 bg-slate-100 rounded hover:bg-slate-200"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {icon}
                                        {item.name}
                                    </div>
                                )}
                            </td>
                            <td className="px-5 py-3 text-center">
                                <Badge variant="light" color={item._count.products > 0 ? 'blue' : 'gray'}>
                                    {item._count.products} Ürün
                                </Badge>
                            </td>
                            <td className="px-5 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => { setEditingId(item.id); setEditName(item.name); }} 
                                        className="p-1.5 text-blue-600 bg-white border border-blue-100 rounded hover:bg-blue-50"
                                        title="Düzenle"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.name)} 
                                        disabled={deletingId === item.id || item._count.products > 0}
                                        className="p-1.5 text-rose-500 bg-white border border-rose-100 rounded hover:bg-rose-50 disabled:opacity-30 disabled:grayscale"
                                        title={item._count.products > 0 ? "Kullanımda olan silinemez" : "Kalıcı Olarak Sil"}
                                    >
                                        {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
