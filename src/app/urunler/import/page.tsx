"use client";

import { useState } from 'react';
import { UploadCloud, ArrowLeft, FileSpreadsheet, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function UrunlerImportPage() {
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [status, setStatus] = useState<any>(null); // Hata / Başarı logları için

    // 1) Şablon İndirme Fonksiyonu (Export Template)
    const downloadTemplate = () => {
        // Örnek başlıklara sahip boş veya örnek 1-2 satırlık veri
        const templateData = [
            {
                "utsCode": "UTS-ORNEK-001",
                "name": "Titanyum Pedikül Vidası 5x45",
                "brand": "MedikalA",
                "minStockLvl": 10,
                "hasExpiration": true
            },
            {
                "utsCode": "UTS-ORNEK-002",
                "name": "Servikal Cage 6mm",
                "brand": "MedikalB",
                "minStockLvl": 5,
                "hasExpiration": false
            }
        ];

        // WorkBook ve WorkSheet oluştur
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Urunler Sablonu");

        // İndir (.xlsx olarak)
        XLSX.writeFile(workbook, "MediStock_Urun_Ekleme_Sablonu.xlsx");
    };

    // 2) Tıklanan Dosyayı Oku ve API'ye Yolla (Import)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setSuccessMsg('');
        setErrorMsg('');
        setStatus(null);

        try {
            // FileReader ile dosyayı oku
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // İlk sayfayı seç
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // JSON'a çevir (İlk satır sütun başlıkları sayılır)
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (jsonData.length === 0) {
                        throw new Error("Seçtiğiniz Excel dosyası boş.");
                    }

                    // API'ye gönder (api/products/import)
                    const res = await fetch('/api/products/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ products: jsonData })
                    });

                    const result = await res.json();

                    if (!res.ok) {
                        throw new Error(result.error || "İçe aktarma sırasında bilinmeyen bir hata oluştu.");
                    }

                    setSuccessMsg(`${result.successCount} adet ürün başarıyla okundu ve işlendi!`);
                    setStatus({
                        success: result.successCount,
                        skipped: result.skipCount,
                        errors: result.errors
                    });

                } catch (err: any) {
                    setErrorMsg(err.message || 'Excel verisi okunurken bir hata oluştu.');
                } finally {
                    setLoading(false);
                    // Aynı dosyayı tekrar seçebilmek için inputu temizle
                    e.target.value = '';
                }
            };

            reader.onerror = () => {
                setErrorMsg("Dosya okuma hatası.");
                setLoading(false);
            };

            reader.readAsArrayBuffer(file);

        } catch (error: any) {
            setErrorMsg(error.message || 'Bilinmeyen bir hata.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/urunler" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" /> Ürünlere Dön
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                        Excel'den Toplu İçe Aktar
                    </h1>
                    <p className="text-slate-500 mt-1">Sisteme yüzlerce ürünü tek bir Excel (.xlsx, .csv) dosyası ile hızlıca yükleyin.</p>
                </div>

                <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm shrink-0 flex items-center gap-2"
                >
                    <Download className="w-4 h-4 text-emerald-600" /> Örnek Şablonu İndir
                </button>
            </div>

            {/* BAŞARI / HATA MESAJLARI */}
            {successMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 font-semibold mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        {successMsg}
                    </div>
                    {status && (
                        <div className="text-sm mt-3 bg-white/50 p-3 rounded-lg border border-emerald-100">
                            <p>Başarılı İşlem: {status.success} kayıt</p>
                            <p>Atlanan/Hatalı: {status.skipped} kayıt</p>
                            {status.errors && status.errors.length > 0 && (
                                <ul className="list-disc list-inside mt-2 text-rose-600 font-medium max-h-40 overflow-y-auto">
                                    {status.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}
            {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <p className="font-medium">{errorMsg}</p>
                </div>
            )}

            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center mt-8 min-h-[300px]">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Excel İşleniyor, Lütfen Bekleyin...</h3>
                    <p className="text-slate-500 max-w-sm">Veritabanına binlerce ürün yazılıyor olabilir, bu işlem dosyanın boyutuna göre birkaç dakika sürebilir.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-center p-12 mt-8">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UploadCloud className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Excel Dosyanızı Buraya Yükleyin</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Dosya içinde UBB, Ürün Adı ve Kategori sütünlarının (Örnek Şablondaki gibi) dolu olmasına dikkat edin.</p>

                    <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg flex-shrink transition-all active:scale-95">
                        <FileSpreadsheet className="w-5 h-5" /> Dosya Seç (.xlsx)
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>
                </div>
            )}

            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">İçe Aktarma Talimatları</h4>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                    <li>Mutlaka sistemden indireceğiniz güncel <b className="text-emerald-700">Örnek Şablonu</b> kullanın veya Excel başlıklarınızı tam olarak template dosyasındaki gibi yapın.
                        (<code className="bg-slate-200 px-1 rounded">utsCode</code>, <code className="bg-slate-200 px-1 rounded">name</code> vb.)
                    </li>
                    <li>Eğer aynı ÜTS kodlu ürün sistemde zaten varsa, Excel'deki bilgi dikkate alınarak <b>üzerine yazılır (güncellenir)</b>.</li>
                    <li>Sistem maksimum 1000'er adetlik dosyaları daha performanslı işler.</li>
                </ul>
            </div>
        </div>
    );
}
