import { supabase } from './supabaseClient.ts';
import type { PoinRecord, Siswa } from '../types.ts';
import { TipePoin } from '../types.ts';

// ========== DASHBOARD SERVICES ==========

export const getAdminDashboardStats = async () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const { count: totalSiswa } = await supabase.from('siswa').select('id', { count: 'exact', head: true });
    const { count: totalKelas } = await supabase.from('kelas').select('id', { count: 'exact', head: true });
    
    const { count: pelanggaranBulanIni } = await supabase.from('poin_records')
        .select('id', { count: 'exact', head: true })
        .eq('tipe', TipePoin.PELANGGARAN)
        .gte('created_at', firstDayOfMonth);

    const { count: prestasiBulanIni } = await supabase.from('poin_records')
        .select('id', { count: 'exact', head: true })
        .eq('tipe', TipePoin.PRESTASI)
        .gte('created_at', firstDayOfMonth);
        
    return {
        totalSiswa: totalSiswa ?? 0,
        totalKelas: totalKelas ?? 0,
        pelanggaranBulanIni: pelanggaranBulanIni ?? 0,
        prestasiBulanIni: prestasiBulanIni ?? 0,
    };
};

export const getGuruDashboardStats = async (kelasId: string) => {
    const { data: kelasData, error: kelasError } = await supabase.from('kelas').select('nama').eq('id', kelasId).single();
    if (kelasError) console.error("Error fetching class name:", kelasError);

    const { count: jumlahSiswa, error: siswaError } = await supabase.from('siswa').select('id', { count: 'exact', head: true }).eq('kelas_id', kelasId);
    if (siswaError) console.error("Error fetching student count:", siswaError);
    
    return {
        namaKelas: kelasData?.nama ?? '',
        jumlahSiswa: jumlahSiswa ?? 0,
    };
};

export const getSiswaDashboardStats = async (userId: string) => {
    const { data, error } = await supabase.from('siswa').select('total_poin_pelanggaran, total_poin_prestasi').eq('user_id', userId).single();
    if (error) console.error("Error fetching student stats:", error);
    
    return {
        totalPoinPelanggaran: data?.total_poin_pelanggaran ?? 0,
        totalPoinPrestasi: data?.total_poin_prestasi ?? 0,
    };
}


// ========== TEACHER SERVICES ==========

export const getSiswaByGuru = async (kelasId: string): Promise<Siswa[]> => {
    const { data, error } = await supabase.from('siswa').select('*').eq('kelas_id', kelasId);
    if (error) {
        console.error("Error fetching students by teacher:", error);
        return [];
    }
    // Map snake_case to camelCase
    return data.map(s => ({
        id: s.id,
        nisn: s.nisn,
        nama: s.nama,
        kelasId: s.kelas_id,
        totalPoinPelanggaran: s.total_poin_pelanggaran,
        totalPoinPrestasi: s.total_poin_prestasi
    }));
};

type NewPoinRecord = {
    siswa_id: string;
    guru_id: string;
    deskripsi: string;
    poin: number;
    tipe: TipePoin;
};

export const addPoinRecord = async (record: NewPoinRecord): Promise<PoinRecord | null> => {
    // This should ideally be a transaction or an RPC call in Supabase
    // to ensure both operations succeed or fail together.
    
    // 1. Insert the new point record
    const { data: newRecord, error: insertError } = await supabase
        .from('poin_records')
        .insert(record)
        .select()
        .single();
    
    if (insertError) {
        console.error("Error inserting point record:", insertError);
        return null;
    }
    
    // 2. Update the student's total points
    const { data: siswa, error: fetchError } = await supabase
        .from('siswa')
        .select('total_poin_pelanggaran, total_poin_prestasi')
        .eq('id', record.siswa_id)
        .single();

    if (fetchError || !siswa) {
        console.error("Could not fetch student for point update:", fetchError);
        // The record was inserted, but the total couldn't be updated.
        // This requires manual correction or a more robust backend process.
        return {
            id: newRecord.id,
            siswaId: newRecord.siswa_id,
            guruId: newRecord.guru_id,
            deskripsi: newRecord.deskripsi,
            poin: newRecord.poin,
            tipe: newRecord.tipe,
            tanggal: newRecord.created_at,
        };
    }

    const updates = record.tipe === TipePoin.PELANGGARAN
        ? { total_poin_pelanggaran: siswa.total_poin_pelanggaran + record.poin }
        : { total_poin_prestasi: siswa.total_poin_prestasi + record.poin };

    const { error: updateError } = await supabase
        .from('siswa')
        .update(updates)
        .eq('id', record.siswa_id);

    if (updateError) {
        console.error("Error updating student total points:", updateError);
    }
    
    return {
        id: newRecord.id,
        siswaId: newRecord.siswa_id,
        guruId: newRecord.guru_id,
        deskripsi: newRecord.deskripsi,
        poin: newRecord.poin,
        tipe: newRecord.tipe,
        tanggal: newRecord.created_at,
    };
};

// ========== STUDENT SERVICES ==========

export const getPoinRecordsBySiswa = async (userId: string): Promise<PoinRecord[]> => {
    const { data: siswaData, error: siswaError } = await supabase.from('siswa').select('id').eq('user_id', userId).single();
    if (siswaError || !siswaData) {
        console.error("Error finding student for user:", siswaError);
        return [];
    }

    const { data, error } = await supabase.from('poin_records').select('*').eq('siswa_id', siswaData.id);
    if (error) {
        console.error("Error fetching point records:", error);
        return [];
    }
    
    return data.map(r => ({
        id: r.id,
        siswaId: r.siswa_id,
        guruId: r.guru_id,
        deskripsi: r.deskripsi,
        poin: r.poin,
        tipe: r.tipe,
        tanggal: r.created_at,
    }));
};