import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout.tsx';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { getAdviceFromGemini } from '../../services/geminiService.ts';
import type { PoinRecord, Siswa, TipePoin } from '../../types.ts';
import { TipePoin as TipePoinEnum } from '../../types.ts';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth.tsx';
import { getSiswaByGuru, addPoinRecord } from '../../services/supabaseService.ts';

const AiAdviceModal: React.FC<{ advice: string; onClose: () => void }> = ({ advice, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-start">
                <div className="p-2 bg-amber-100 rounded-full mr-4">
                    <LightBulbIcon className="h-6 w-6 text-amber-500"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-dark">Saran dari AI</h3>
                    <p className="text-sm text-gray-500 mb-4">Berikut adalah beberapa saran tindak lanjut:</p>
                </div>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {advice.split('\n').map((line, index) => <p key={index}>{line}</p>)}
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={onClose}>Tutup</Button>
            </div>
        </div>
    </div>
);

const AddRecord: React.FC = () => {
    const { user } = useAuth();
    const [siswaList, setSiswaList] = useState<Siswa[]>([]);
    const [tipe, setTipe] = useState<TipePoin>(TipePoinEnum.PELANGGARAN);
    const [siswaId, setSiswaId] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [poin, setPoin] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [advice, setAdvice] = useState<string | null>(null);
    const [submittedRecord, setSubmittedRecord] = useState<PoinRecord | null>(null);
    const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);

    useEffect(() => {
        if (user?.kelasId) {
            const fetchSiswa = async () => {
                const data = await getSiswaByGuru(user.kelasId!);
                setSiswaList(data);
            };
            fetchSiswa();
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        
        const newRecordData = {
            siswa_id: siswaId,
            guru_id: user.id,
            deskripsi,
            poin,
            tipe,
        };
        
        const newRecord = await addPoinRecord(newRecordData);
        
        if (newRecord) {
            const siswa = siswaList.find(s => s.id === siswaId);
            setSubmittedRecord(newRecord);
            setSelectedSiswa(siswa || null);
        } else {
            // Handle error case
            alert("Gagal menyimpan catatan.");
        }
        setIsLoading(false);
    };
    
    const handleGetAdvice = async () => {
        if (!submittedRecord || !selectedSiswa) return;
        setIsAiLoading(true);
        const aiAdvice = await getAdviceFromGemini(submittedRecord, selectedSiswa);
        setAdvice(aiAdvice);
        setIsAiLoading(false);
    };
    
    const resetForm = () => {
        setSubmittedRecord(null);
        setSelectedSiswa(null);
        setSiswaId('');
        setDeskripsi('');
        setPoin(0);
        setAdvice(null);
    }

    if (submittedRecord) {
        return (
            <Layout title="Tambah Catatan Poin">
                <Card className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-secondary mb-2">Catatan Berhasil Disimpan!</h2>
                    <p className="text-center text-gray-600 mb-6">Catatan untuk <strong>{selectedSiswa?.nama}</strong> telah ditambahkan.</p>
                    
                    <div className="bg-gray-50 rounded-md p-4 mb-6">
                        <p><strong>Tipe:</strong> <span className="capitalize">{submittedRecord.tipe}</span></p>
                        <p><strong>Deskripsi:</strong> {submittedRecord.deskripsi}</p>
                        <p><strong>Poin:</strong> {submittedRecord.poin}</p>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <Button onClick={handleGetAdvice} variant="secondary" isLoading={isAiLoading}>
                            <LightBulbIcon className="h-5 w-5 mr-2"/>
                            Dapatkan Saran Tindak Lanjut dari AI
                        </Button>
                        <Button onClick={resetForm} variant="primary">Tambah Catatan Lain</Button>
                    </div>
                </Card>
                {advice && <AiAdviceModal advice={advice} onClose={() => setAdvice(null)} />}
            </Layout>
        );
    }

    return (
        <Layout title="Tambah Catatan Poin">
            <Card className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Tipe Catatan</label>
                        <div className="flex rounded-md shadow-sm">
                            <button type="button" onClick={() => setTipe(TipePoinEnum.PELANGGARAN)} className={`px-4 py-2 border w-1/2 rounded-l-md ${tipe === TipePoinEnum.PELANGGARAN ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50'}`}>
                                Pelanggaran
                            </button>
                            <button type="button" onClick={() => setTipe(TipePoinEnum.PRESTASI)} className={`px-4 py-2 border w-1/2 rounded-r-md ${tipe === TipePoinEnum.PRESTASI ? 'bg-secondary text-white' : 'bg-white hover:bg-gray-50'}`}>
                                Prestasi
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="siswa" className="block text-gray-700 font-bold mb-2">Pilih Siswa</label>
                        <select id="siswa" value={siswaId} onChange={e => setSiswaId(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="" disabled>-- Pilih Siswa --</option>
                            {siswaList.map(s => <option key={s.id} value={s.id}>{s.nama} ({s.nisn})</option>)}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="deskripsi" className="block text-gray-700 font-bold mb-2">Deskripsi</label>
                        <textarea id="deskripsi" value={deskripsi} onChange={e => setDeskripsi(e.target.value)} required rows={4} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder={tipe === TipePoinEnum.PELANGGARAN ? 'Contoh: Tidak mengerjakan PR' : 'Contoh: Juara 1 lomba cerdas cermat'}/>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="poin" className="block text-gray-700 font-bold mb-2">Poin</label>
                        <input type="number" id="poin" value={poin} onChange={e => setPoin(parseInt(e.target.value) || 0)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Simpan Catatan
                    </Button>
                </form>
            </Card>
        </Layout>
    );
};

export default AddRecord;