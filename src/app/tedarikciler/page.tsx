import { Building2, Plus, Upload, Filter, Search } from 'lucide-react';
import Link from 'next/link';

export default function TedarikcilerPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* BAŞLIK VE HIZLI EYLEMLER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-blue-600" />
                        Tedarikçiler
                    </h1>
                    <p className="text-slate-500 mt-1">Ürün ve malzeme aldığınız ana üretici veya aracı firmalar.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Toplu Excel Yükleme
                    </button>
                    <Link href="/tedarikciler/yeni" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" /> Yeni Tedarikçi
                    </Link>
                </div>
            </div>

            {/* FİLTRE & ARAMA BAR */}
            <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tedarikçi adı, vergi no, kişi ara..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 w-full sm:w-auto justify-center">
                        <Filter className="w-4 h-4" /> Filtrele
                    </button>
                </div>
            </div>

            {/* TEDARİKÇİLER TABLOSU */}
            <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Firma (Ünvan)</th>
                                <th className="px-6 py-4">Vergi Numarası</th>
                                <th className="px-6 py-4">İletişim Kişisi</th>
                                <th className="px-6 py-4">Telefon</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">

                            <tr className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">MÜ</div>
                                        <div>
                                            <div className="font-semibold text-slate-900">Medikal Üretim A.Ş.</div>
                                            <div className="text-slate-500 text-xs mt-0.5" title="Satınalma departmanı adresi">İstanbul / Şişli</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600">6130459912</td>
                                <td className="px-6 py-4 text-slate-700 font-medium">Ahmet Yılmaz</td>
                                <td className="px-6 py-4 text-slate-600">0555 123 4567</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">Düzenle</button>
                                </td>
                            </tr>

                            <tr className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">OT</div>
                                        <div>
                                            <div className="font-semibold text-slate-900">OrthoTech İthalat Ltd.</div>
                                            <div className="text-slate-500 text-xs mt-0.5" title="Satınalma departmanı adresi">Ankara / Çankaya</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600">8810234471</td>
                                <td className="px-6 py-4 text-slate-700 font-medium">Zeynep Kaya</td>
                                <td className="px-6 py-4 text-slate-600">0312 455 8899</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">Düzenle</button>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                    <span>Toplam <strong>2</strong> tedarikçi kaydı bulunuyor.</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 rounded text-slate-400 bg-white cursor-not-allowed">Önceki</button>
                        <button className="px-3 py-1 border border-slate-200 rounded text-slate-400 bg-white cursor-not-allowed">Sonraki</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
