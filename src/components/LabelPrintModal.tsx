"use client";

import { useState, useCallback } from 'react';
import { X, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface LotLabel {
    productName: string;
    productUts?: string | null;
    productDimension?: string | null;
    productBarcode?: string | null;
    productCategory?: string | null;
    lotNo: string;
    expDate?: string | null;
    quantity?: number;
}

interface Props {
    lot: LotLabel;
    onClose: () => void;
}

export default function LabelPrintModal({ lot, onClose }: Props) {
    const [copies, setCopies] = useState(1);

    // QR içeriği — makine tarafından okunabilir, yapılandırılmış format
    const qrContent = [
        `LOT:${lot.lotNo}`,
        `URN:${lot.productName}`,
        lot.productUts   ? `UTS:${lot.productUts}` : '',
        lot.expDate      ? `SKT:${new Date(lot.expDate).toLocaleDateString('tr-TR')}` : '',
        lot.productDimension ? `OLC:${lot.productDimension}` : '',
    ].filter(Boolean).join('\n');

    const expStr = lot.expDate ? new Date(lot.expDate).toLocaleDateString('tr-TR') : null;
    const isExpiring = lot.expDate &&
        new Date(lot.expDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const today = new Date().toLocaleDateString('tr-TR');

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    return (
        <>
            {/* ---- Ekran görünümü ---- */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
                    {/* Başlık */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-blue-600" />
                            <h2 className="font-bold text-slate-900">Etiket Yazdır</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Önizleme */}
                    <div className="p-6">
                        <p className="text-xs text-slate-500 mb-4">Ön izleme — tarayıcınızın baskı iletişim kutusu açılacak.</p>
                        <div className="flex justify-center">
                            <LabelCard lot={lot} qrContent={qrContent} expStr={expStr} isExpiring={!!isExpiring} today={today} />
                        </div>

                        {/* Kopya sayısı */}
                        <div className="mt-5 flex items-center gap-3">
                            <span className="text-sm text-slate-600 font-medium">Kopya sayısı:</span>
                            <input
                                type="number" min={1} max={50} value={copies}
                                onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 pb-5">
                        <button onClick={onClose} className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                            İptal
                        </button>
                        <button onClick={handlePrint} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                            <Printer className="w-4 h-4" /> Yazdır
                        </button>
                    </div>
                </div>
            </div>

            {/* ---- Sadece baskıda görünen içerik ---- */}
            <div className="print-only">
                {Array.from({ length: copies }).map((_, i) => (
                    <LabelCard key={i} lot={lot} qrContent={qrContent} expStr={expStr} isExpiring={!!isExpiring} today={today} printMode />
                ))}
            </div>

            {/* ---- Baskı CSS ---- */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body > * { display: none !important; }
                    .print-only { display: flex !important; flex-wrap: wrap; gap: 6px; padding: 8px; }
                    .print-label {
                        display: flex !important;
                        width: 62mm;
                        min-height: 42mm;
                        border: 1.5px solid #333;
                        border-radius: 4px;
                        padding: 5px 6px;
                        flex-direction: column;
                        page-break-inside: avoid;
                        background: white !important;
                        font-family: Arial, sans-serif;
                    }
                }
                .print-only { display: none; }
            `}} />
        </>
    );
}

/* ---- Alt bileşen: Hem önizleme hem baskı için ortak kart ---- */
function LabelCard({ lot, qrContent, expStr, isExpiring, today, printMode = false }: {
    lot: LotLabel; qrContent: string; expStr: string | null;
    isExpiring: boolean; today: string; printMode?: boolean;
}) {
    const cls = printMode
        ? 'print-label'
        : 'border-2 border-slate-300 rounded-lg p-3 bg-white shadow-sm';

    const nameStyle = printMode
        ? { fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, borderBottom: '1px solid #ccc', paddingBottom: 2, marginBottom: 4, lineHeight: 1.2 }
        : { fontSize: 10, fontWeight: 800 };

    return (
        <div className={cls} style={printMode ? {} : { width: 248, minHeight: 160, fontFamily: 'Arial, sans-serif' }}>
            {/* Ürün adı */}
            <div style={nameStyle} className={printMode ? '' : 'border-b border-slate-200 pb-1 mb-2 text-slate-900 leading-tight text-[10px] font-black uppercase'}>
                {lot.productName}{lot.productDimension ? ` — ${lot.productDimension}` : ''}
            </div>

            {/* Gövde */}
            <div style={{ display: 'flex', gap: printMode ? 5 : 12, alignItems: 'flex-start', flex: 1 }}>
                {/* Bilgi alanları */}
                <div style={{ flex: 1 }}>
                    <InfoRow label="LOT NO" value={lot.lotNo} mono highlight printMode={printMode} />
                    {expStr && <InfoRow label="SKT" value={expStr} warn={isExpiring} printMode={printMode} />}
                    {lot.productUts && <InfoRow label="ÜTS" value={lot.productUts} printMode={printMode} />}
                    {lot.productBarcode && <InfoRow label="Barkod" value={lot.productBarcode} mono printMode={printMode} />}
                    {lot.quantity !== undefined && <InfoRow label="Stok" value={`${lot.quantity} adet`} printMode={printMode} />}
                </div>

                {/* QR Kod */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <QRCodeSVG value={qrContent} size={printMode ? 72 : 72} level="M" />
                    <span style={{ fontSize: 6, color: '#999', textAlign: 'center' }}>Tara & Doğrula</span>
                </div>
            </div>

            {/* Alt bant */}
            <div style={{ fontSize: 6.5, color: '#aaa', borderTop: '1px solid #eee', paddingTop: 2, marginTop: 3, textAlign: 'center' }}>
                VK Spine MediStock • {today}
            </div>
        </div>
    );
}

function InfoRow({ label, value, mono = false, highlight = false, warn = false, printMode = false }: {
    label: string; value: string; mono?: boolean; highlight?: boolean; warn?: boolean; printMode?: boolean;
}) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, lineHeight: 1.3 }}>
            <span style={{ fontSize: printMode ? 7 : 8, color: '#777', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap', marginRight: 4 }}>
                {label}
            </span>
            <span style={{
                fontSize: printMode ? 8 : 9,
                fontWeight: 700,
                color: warn ? '#c0392b' : '#111',
                fontFamily: mono ? 'monospace' : 'inherit',
                background: highlight ? '#f0f0f0' : 'transparent',
                padding: highlight ? '1px 3px' : 0,
                borderRadius: 2,
                textAlign: 'right',
            }}>
                {value}
            </span>
        </div>
    );
}
