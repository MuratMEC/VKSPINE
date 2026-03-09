"use client";

import { useState, useEffect } from 'react';
import { SwitchCamera, Download, Filter, Loader2, RefreshCcw, Search, X, Calendar } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import * as XLSX from 'xlsx';

export default function StokHareketleriPage() {
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtre State
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | IN | OUT
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadMovements = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/stock/movements');
            if (res.ok) {
                const data = await res.json();
                setMovements(data);
            }
        } catch (err) {
            console.error("Hareketler alınamadı:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMovements();
    }, []);

    // İstemci taraflı filtreleme
    const filteredMovements = movements.filter(mov => {
        // Tip filtresi
        if (typeFilter === 'IN' && mov.type !== 'IN') return false;
        if (typeFilter === 'OUT' && mov.type !== 'OUT') return false;

        // Tarih Aralığı Filtresi
        if (startDate || endDate) {
            const movDate = new Date(mov.createdAt);
            if (startDate) {
                const start = startOfDay(parseISO(startDate));
                if (movDate < start) return false;
            }
            if (endDate) {
                const end = endOfDay(parseISO(endDate));
                if (movDate > end) return false;
            }
        }

        // Arama filtresi
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const productName = (mov.product?.name || '').toLowerCase();
            const lotNo = (mov.lot?.lotNo || '').toLowerCase();
            const utsCode = (mov.product?.utsCode || '').toLowerCase();
            const docNo = (mov.documentNo || '').toLowerCase();
            const customer = (mov.customer?.name || '').toLowerCase();
            const supplier = (mov.supplier?.name || '').toLowerCase();
            if (!productName.includes(term) && !lotNo.includes(term) && !utsCode.includes(term) && !docNo.includes(term) && !customer.includes(term) && !supplier.includes(term)) {
                return false;
            }
        }

        return true;
    });

    // Excel Dışa Aktarım
    const handleExcelExport = () => {
        if (filteredMovements.length === 0) return;

        const exportData = filteredMovements.map((mov, index) => ({
            'Sıra': index + 1,
            'Tarih': format(new Date(mov.createdAt), 'dd.MM.yyyy HH:mm'),
            'Ürün Adı': mov.product?.name || 'Bilinmeyen',
            'ÜTS Kodu': mov.product?.utsCode || '',
            'Lot No': mov.lot?.lotNo || '',
            'İşlem Tipi': mov.type === 'OUT' ? 'ÇIKIŞ' : 'GİRİŞ',
            'Miktar': mov.quantity,
            'Kurum': mov.type === 'OUT' ? (mov.customer?.name || '') : (mov.supplier?.name || ''),
            'Belge No': mov.documentNo || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Sütun genişlikleri
        worksheet['!cols'] = [
            { wch: 5 },  // Sıra
            { wch: 18 }, // Tarih
            { wch: 30 }, // Ürün Adı
            { wch: 20 }, // ÜTS
            { wch: 15 }, // Lot
            { wch: 10 }, // Tip
            { wch: 8 },  // Miktar
            { wch: 25 }, // Kurum
            { wch: 20 }, // Belge No
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Hareketleri");

        const fileName = `Stok_Hareketleri_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('ALL');
        setStartDate('');
        setEndDate('');
    };

    const hasActiveFilter = searchTerm || typeFilter !== 'ALL' || startDate || endDate;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* BAŞLIK VE HIZLI EYLEMLER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <SwitchCamera className="w-6 h-6 text-indigo-600" />
                        Stok Hareketleri ve Raporlar
                    </h1>
                    <p className="text-slate-500 mt-1">Sisteme giren (Mal Kabul) veya ameliyata çıkan tüm ürünlerin detaylı işlem logu.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={loadMovements} className="px-3 py-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" title="Yenile">
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleExcelExport}
                        disabled={filteredMovements.length === 0}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" /> Excel Olarak Dışa Aktar
                    </button>
                </div>
            </div>

            {/* FİLTRE BARI */}
            <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Ürün / Kurum / Belge Ara</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ürün, lot, kurum..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Hareket Tipi</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                        >
                            <option value="ALL">Tüm Hareketler</option>
                            <option value="IN">Sadece Girişler</option>
                            <option value="OUT">Sadece Çıkışlar</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Başlangıç Tarihi
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Bitiş Tarihi
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilter && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors w-full justify-center"
                            >
                                <X className="w-4 h-4" /> Temizle
                            </button>
                        )}
                        {!hasActiveFilter && (
                             <div className="text-xs text-slate-500 ml-auto w-full text-right px-2">
                                {filteredMovements.length} kayıt
                            </div>
                        )}
                    </div>
                </div>
                {hasActiveFilter && (
                    <div className="mt-2 text-xs text-slate-500 text-right">
                         Filtrelenen: <strong>{filteredMovements.length}</strong> / Toplam: {movements.length} kayıt
                    </div>
                )}
            </div>

            {/* VERİ TABLOSU */}
            <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Hareket Logları Veritabanından Getiriliyor...</p>
                    </div>
                ) : filteredMovements.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <SwitchCamera className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">
                            {hasActiveFilter ? 'Filtreye uygun hareket bulunamadı' : 'Henüz Bir Stok Hareketi Yok'}
                        </h3>
                        <p className="text-slate-500">
                            {hasActiveFilter
                                ? 'Arama kriterlerinizi değiştirin veya filtreleri temizleyin.'
                                : 'Stok Giriş veya Stok Çıkış menülerinden işlem yaptığınızda tüm dökümler burada listelenecektir.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Tarih</th>
                                    <th className="px-6 py-4">Ürün Adı ve Lot</th>
                                    <th className="px-6 py-4">İşlem Tipi</th>
                                    <th className="px-6 py-4">Miktar</th>
                                    <th className="px-6 py-4">İlgili Kurum / Belge No</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMovements.map((mov) => {
                                    const isOut = mov.type === 'OUT';
                                    return (
                                        <tr key={mov.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                {format(new Date(mov.createdAt), 'dd.MM.yyyy HH:mm')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{mov.product?.name || 'Bilinmeyen Ürün'}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {mov.product?.utsCode && (
                                                        <span className="text-slate-500 text-[11px] font-mono bg-slate-100 px-1 inline-block rounded">
                                                            {mov.product.utsCode}
                                                        </span>
                                                    )}
                                                    {mov.lot && (
                                                        <span className="text-slate-600 text-[11px] font-mono bg-indigo-50 border border-indigo-100 px-1 inline-block rounded">
                                                            Lot: {mov.lot.lotNo}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isOut ? (
                                                    <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-rose-700 bg-rose-50 border border-rose-100">
                                                        ÇIKIŞ (Ameliyat)
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100">
                                                        GİRİŞ (Kabul)
                                                    </div>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 font-bold ${isOut ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {isOut ? '-' : '+'}{mov.quantity}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-800 font-medium truncate max-w-[200px]">
                                                    {isOut ? (mov.customer?.name || 'Belirtilmedi') : (mov.supplier?.name || 'Belirtilmedi')}
                                                </div>
                                                {mov.documentNo && <div className="text-slate-500 text-xs mt-0.5 font-mono">Belge: {mov.documentNo}</div>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
