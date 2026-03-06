import { Package, Plus } from 'lucide-react';
import Link from 'next/link';

export default function StokYonetimiPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="w-6 h-6 text-blue-600" />
                        Stok Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-1">Sistemdeki tüm ürünler, lotlar ve stok hareketleri.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/stok/cikis" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                        Stok Çıkışı (Ameliyat)
                    </Link>
                    <Link href="/stok/giris" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                        <Plus className="w-4 h-4" /> Stok Girişi (Mal Kabul)
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Package className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Henüz Stok Hareketi Yok</h3>
                <p className="text-slate-500 max-w-md pb-6">Veritabanındaki stok tablolarını bu ekrana yansıtmak için bir sonraki adımı bekleyin.</p>
            </div>
        </div>
    );
}
