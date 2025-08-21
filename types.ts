
export enum Role {
  ADMIN = 'admin',
  GURU = 'guru',
  SISWA = 'siswa',
}

export interface User {
  id: string;
  email: string;
  nama: string;
  role: Role;
  kelasId?: string; // for teachers
  nisn?: string; // for students
}

export interface Kelas {
  id: string;
  nama: string;
  waliKelasId: string;
}

export interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  kelasId: string;
  totalPoinPelanggaran: number;
  totalPoinPrestasi: number;
}

export enum TipePoin {
  PELANGGARAN = 'pelanggaran',
  PRESTASI = 'prestasi',
}

export interface PoinRecord {
  id: string;
  siswaId: string;
  guruId: string;
  deskripsi: string;
  poin: number;
  tipe: TipePoin;
  tanggal: string; // ISO 8601 format
}

export interface TahunAjaran {
  id: string;
  tahun: string; // e.g., "2023/2024"
  isActive: boolean;
}