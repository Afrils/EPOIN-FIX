import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout.tsx';
import { Card } from '../../components/ui/Card.tsx';
import type { PoinRecord } from '../../types.ts';
import { TipePoin } from '../../types.ts';
import { ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useAuth } from '../../hooks/useAuth.tsx';
import { getPoinRecordsBySiswa } from '../../services/supabaseService.ts';


const RecordItem: React.FC<{ record: PoinRecord }> = ({ record }) => {
    const isPelanggaran = record.tipe === TipePoin.PELANGGARAN;
    const Icon = isPelanggaran ? ExclamationTriangleIcon : SparklesIcon;
    const color = isPelanggaran ? 'text-red-500' : 'text-emerald-500';

    return (
        <div className="flex items-start space-x-4 p-4 border-b">
            <Icon className={`h-6 w-6 mt-1 ${color}`} />
            <div className="flex-1">
                <p className="font-semibold text-dark">{record.deskripsi}</p>
                <p className="text-sm text-gray-500">{new Date(record.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className={`font-bold text-lg ${color}`}>
                {isPelanggaran ? '+' : ''}{record.poin} Poin
            </div>
        </div>
    );
};


const MyPoints: React.FC = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState<PoinRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchRecords = async () => {
            const data = await getPoinRecordsBySiswa(user.id);
            setRecords(data);
            setLoading(false);
        };
        fetchRecords();
    }, [user]);

    const totalPelanggaran = records
        .filter(p => p.tipe === TipePoin.PELANGGARAN)
        .reduce((acc, p) => acc + p.poin, 0);
    
    const totalPrestasi = records
        .filter(p => p.tipe === TipePoin.PRESTASI)
        .reduce((acc, p) => acc + p.poin, 0);

    const chartData = [
        { name: 'Pelanggaran', Poin: totalPelanggaran, fill: '#ef4444' },
        { name: 'Prestasi', Poin: totalPrestasi, fill: '#10b981' },
    ];

    return (
        <Layout title="Poin Saya">
            {loading ? <p>Loading data poin...</p> : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                         <Card title="Riwayat Poin">
                            <div className="max-h-[600px] overflow-y-auto">
                                {records.length > 0 ? (
                                    records.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map(record => <RecordItem key={record.id} record={record} />)
                                ) : (
                                    <p className="text-center text-gray-500 p-4">Belum ada catatan poin.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                    <div>
                         <Card title="Ringkasan Poin">
                             <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Poin" fill="fill" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                                    <span className="font-semibold text-red-700">Total Poin Pelanggaran</span>
                                    <span className="font-bold text-red-700">{totalPelanggaran}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-md">
                                    <span className="font-semibold text-emerald-700">Total Poin Prestasi</span>
                                    <span className="font-bold text-emerald-700">{totalPrestasi}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MyPoints;