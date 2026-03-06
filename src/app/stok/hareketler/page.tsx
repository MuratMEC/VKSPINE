"use client";

import { useState, useEffect } from 'react';
import { SwitchCamera, Download, Filter, PieChart, Loader2, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

export default function StokHareketleriPage() {
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                    <button className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors shadow-sm flex items-center gap-2">
                        <PieChart className="w-4 h-4" /> Pivot Görünüm
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Download className="w-4 h-4" /> Excel Olarak Dışa Aktar
                    </button>
                </div>
            </div>

            {/* FİLTRE BARI (Statik Görsel) */}
            <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Ürün Ara (İsim / Barkod)"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700">
                        <option>Tüm Hareket Tipleri</option>
                        <option>Giriş (IN)</option>
                        <option>Çıkış (OUT)</option>
                    </select>
                </div>
                <div>
                    <input
                        type="date"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                    />
                </div>
                <div className="flex items-center justify-end">
                    <button className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 w-full md:w-auto justify-center">
                        <Filter className="w-4 h-4" /> Tümünü Filtrele
                    </button>
                </div>
            </div>

            {/* VERİ TABLOSU */}
            <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Hareket Logları Veritabanından Getiriliyor...</p>
                    </div>
                ) : movements.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <SwitchCamera className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Henüz Bir Stok Hareketi Yok</h3>
                        <p className="text-slate-500">Stok Giriş veya Stok Çıkış menülerinden işlem yaptığınızda tüm dökümler burada listelenecektir.</p>
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
                                {movements.map((mov) => {
                                    const isOut = mov.type === 'OUT';
                                    return (
                                        <tr key={mov.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                {format(new Date(mov.createdAt), 'dd.MM.yyyy HH:mm')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{mov.product?.name || 'Bilinmeyen Ürün'}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-slate-500 text-[11px] font-mono bg-slate-100 px-1 inline-block rounded">
                                                        {mov.product?.utsCode}
                                                    </span>
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
