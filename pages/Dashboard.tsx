import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { Layout } from '../components/Layout.tsx';
import { Role } from '../types.ts';
import { Card } from '../components/ui/Card.tsx';
import { UserGroupIcon, ExclamationTriangleIcon, SparklesIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { getAdminDashboardStats, getGuruDashboardStats, getSiswaDashboardStats } from '../services/supabaseService.ts';

interface AdminStats {
    totalSiswa: number;
    pelanggaranBulanIni: number;
    prestasiBulanIni: number;
    totalKelas: number;
}
const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getAdminDashboardStats();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading || !stats) return <p>Loading dashboard...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 text-primary">
                        <UserGroupIcon className="h-8 w-8"/>
                    </div>
                    <div className="ml-4">
                        <p className="text-lg font-semibold text-dark">{stats.totalSiswa}</p>
                        <p className="text-sm text-gray-500">Total Siswa</p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                        <ExclamationTriangleIcon className="h-8 w-8"/>
                    </div>
                    <div className="ml-4">
                        <p className="text-lg font-semibold text-dark">{stats.pelanggaranBulanIni}</p>
                        <p className="text-sm text-gray-500">Pelanggaran Bulan Ini</p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-emerald-100 text-secondary">
                        <SparklesIcon className="h-8 w-8"/>
                    </div>
                    <div className="ml-4">
                        <p className="text-lg font-semibold text-dark">{stats.prestasiBulanIni}</p>
                        <p className="text-sm text-gray-500">Prestasi Bulan Ini</p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                        <ChartPieIcon className="h-8 w-8"/>
                    </div>
                    <div className="ml-4">
                        <p className="text-lg font-semibold text-dark">{stats.totalKelas}</p>
                        <p className="text-sm text-gray-500">Kelas Aktif</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

interface GuruStats {
    namaKelas: string;
    jumlahSiswa: number;
}

const GuruDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<GuruStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.kelasId) return;
        const fetchStats = async () => {
            const data = await getGuruDashboardStats(user.kelasId);
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, [user]);
    
    if (loading || !stats) return <p>Loading dashboard...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title={`Kelas Anda: ${stats.namaKelas || 'Belum ditugaskan'}`}>
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 text-primary">
                        <UserGroupIcon className="h-8 w-8"/>
                    </div>
                    <div className="ml-4">
                        <p className="text-lg font-semibold text-dark">{stats.jumlahSiswa}</p>
                        <p className="text-sm text-gray-500">Jumlah Siswa</p>
                    </div>
                </div>
            </Card>
            <Card title="Aktivitas Terbaru">
                <p className="text-gray-600">Lihat daftar siswa dan tambahkan catatan poin terbaru.</p>
            </Card>
        </div>
    );
};

interface SiswaStats {
    totalPoinPelanggaran: number;
    totalPoinPrestasi: number;
}

const SiswaDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<SiswaStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            const data = await getSiswaDashboardStats(user.id);
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, [user]);

    if (loading || !stats) return <p>Loading dashboard...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                 <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600">
                        <ExclamationTriangleIcon className="h-8 w-8"/>
                    </div>
                    <div className="ml-4">
                        <p className="text-lg font-semibold text-dark">{stats.totalPoinPelanggaran}</p>
                        <p className="text-sm text-gray-500">Total Poin Pelanggaran</p>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center">
                    <div className="p-3 rounded-full bg-emerald-100 text-secondary">
                        <SparklesIcon className="h-8 w-8"/>
                    </div>
                    <div className="ml-4">
                        <p className="text-lg font-semibold text-dark">{stats.totalPoinPrestasi}</p>
                        <p className="text-sm text-gray-500">Total Poin Prestasi</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case Role.ADMIN:
        return <AdminDashboard />;
      case Role.GURU:
        return <GuruDashboard />;
      case Role.SISWA:
        return <SiswaDashboard />;
      default:
        return <p>Dashboard tidak tersedia.</p>;
    }
  };

  return (
    <Layout title="Dashboard">
        <div className="mb-6">
            <h2 className="text-2xl font-semibold text-dark">Selamat Datang, {user?.nama}!</h2>
            <p className="text-gray-600">Berikut adalah ringkasan aktivitas di sekolah.</p>
        </div>
        {renderDashboard()}
    </Layout>
  );
};

export default Dashboard;