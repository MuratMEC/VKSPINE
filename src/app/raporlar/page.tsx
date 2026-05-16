"use client";

import { useState, useEffect } from 'react';
import { 
    Activity, Calendar, Users, HardDrive, BarChart3, 
    ChevronRight, Download, Filter, TrendingUp, UserCheck, 
    Stethoscope, Building2, Clock, Loader2 
} from 'lucide-react';
import { BarChart, DonutChart } from '@mantine/charts';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports?start=${dateRange.start}&end=${dateRange.end}`);
            const json = await res.json();
            setData(json);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Raporlar hazırlanıyor...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* ÜST BAŞLIK VE FİLTRELER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-rose-600" /> Analiz ve Raporlar
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Saha operasyonları ve kaynak kullanım metrikleri.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-slate-100">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="text-sm font-bold text-slate-700 outline-none bg-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3">
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="text-sm font-bold text-slate-700 outline-none bg-transparent"
                        />
                    </div>
                    <button 
                        onClick={() => {
                            // Basit bir CSV export örneği (Excel ile açılabilir)
                            const rows = [
                                ["Personel Adı", "Rol", "Vaka Sayısı"],
                                ...data.personnelStats.map((p: any) => [p.name, p.role, p.count])
                            ];
                            let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.join(";")).join("\n");
                            const link = document.createElement("a");
                            link.setAttribute("href", encodeURI(csvContent));
                            link.setAttribute("download", `rapor_${dateRange.start}_${dateRange.end}.csv`);
                            document.body.appendChild(link);
                            link.click();
                        }}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                    >
                        <Download className="w-4 h-4" /> Excel'e Aktar
                    </button>
                    <button 
                        onClick={fetchReports}
                        className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ÖZET KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-rose-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 rounded-2xl group-hover:scale-110 transition-transform">
                            <Activity className="w-6 h-6 text-rose-600" />
                        </div>
                        <Badge value="TOPLAM VAKA" color="rose" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900">{data.summary.totalSurgeries}</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Seçili dönemdeki operasyon</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
                            <UserCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <Badge value="AKTİF EKİP" color="blue" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900">{data.summary.personnelCount}</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Sahada görev alan personel</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl group-hover:scale-110 transition-transform">
                            <HardDrive className="w-6 h-6 text-indigo-600" />
                        </div>
                        <Badge value="CİHAZ KULLANIMI" color="indigo" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-900">{data.summary.deviceCount}</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Kullanılan farklı set/cihaz</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-3xl shadow-xl shadow-blue-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-white text-lg font-bold">Vaka Yoğunluğu</h3>
                    <p className="text-blue-100 text-sm mt-1 leading-relaxed">
                        Seçili dönemde günlük ortalama <span className="text-white font-bold">{(data.summary.totalSurgeries / 30).toFixed(1)}</span> vaka gerçekleştirildi.
                    </p>
                </div>
            </div>

            {/* GRAFİKLER VE DETAYLI ANALİZLER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personel Performansı */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <Users className="w-6 h-6 text-blue-500" /> Personel Performansı (Vaka Sayısı)
                        </h2>
                    </div>
                    {data.personnelStats.length > 0 ? (
                        <BarChart
                            h={300}
                            data={data.personnelStats.slice(0, 8)}
                            dataKey="name"
                            series={[{ name: 'count', label: 'Vaka Sayısı', color: 'blue.5' }]}
                            tickLine="y"
                            gridAxis="y"
                            barProps={{ radius: [10, 10, 0, 0] }}
                        />
                    ) : (
                        <EmptyState />
                    )}
                </div>

                {/* En Aktif Hastaneler */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-emerald-500" /> En Yoğun Kurumlar
                        </h2>
                    </div>
                    {data.hospitalStats.length > 0 ? (
                        <BarChart
                            h={300}
                            data={data.hospitalStats.slice(0, 8)}
                            dataKey="name"
                            series={[{ name: 'count', label: 'Vaka Sayısı', color: 'teal.5' }]}
                            orientation="vertical"
                            gridAxis="none"
                            barProps={{ radius: [0, 10, 10, 0] }}
                        />
                    ) : (
                        <EmptyState />
                    )}
                </div>
            </div>

            {/* DETAY TABLOLARI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* En Çok Çalışan Doktorlar */}
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <Stethoscope className="w-5 h-5 text-rose-500" />
                        <span className="font-bold text-slate-900">En Çok Çalışan Doktorlar</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {data.doctorStats.map((d: any, i: number) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold">{i+1}</div>
                                    <span className="text-sm font-bold text-slate-700">Dr. {d.name}</span>
                                </div>
                                <Badge value={`${d.count} Vaka`} color="rose" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cihaz Kullanım Sıklığı */}
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <HardDrive className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-slate-900">Cihaz Kullanım Sıklığı</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {data.deviceStats.map((d: any, i: number) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">{i+1}</div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-700">{d.name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">SN: {d.serial}</div>
                                    </div>
                                </div>
                                <Badge value={`${d.count} Kullanım`} color="indigo" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Personel Bazlı Liste */}
                <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="font-bold text-slate-900">Personel Vaka Sayıları</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {data.personnelStats.map((p: any, i: number) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">{i+1}</div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-700">{p.name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">{p.role}</div>
                                    </div>
                                </div>
                                <Badge value={`${p.count} Vaka`} color="blue" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ value, color }: { value: string, color: string }) {
    const colors: any = {
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };
    return (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${colors[color]}`}>
            {value}
        </span>
    );
}

function EmptyState() {
    return (
        <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 italic">
            <Clock className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Seçili tarihlerde veri bulunamadı.</p>
        </div>
    );
}
