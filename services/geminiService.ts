
import { GoogleGenAI } from "@google/genai";
import type { PoinRecord, Siswa } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set for Gemini. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getAdviceFromGemini = async (record: PoinRecord, siswa: Siswa): Promise<string> => {
  if (!API_KEY) {
    return "Fitur AI dinonaktifkan karena API Key tidak ditemukan. Mohon konfigurasikan environment variable API_KEY.";
  }

  const prompt = `
    Anda adalah seorang psikolog pendidikan dan konselor sekolah yang berpengalaman.
    Seorang guru telah mencatat sebuah ${record.tipe} untuk siswa bernama ${siswa.nama}.
    Detailnya adalah sebagai berikut:
    - ${record.tipe === 'pelanggaran' ? 'Pelanggaran' : 'Prestasi'}: ${record.deskripsi}
    - Poin yang diberikan: ${record.poin}
    
    Tolong berikan saran yang konstruktif dan praktis kepada guru tentang bagaimana cara menindaklanjuti hal ini.
    Saran harus positif, mendidik, dan fokus pada pengembangan karakter siswa.
    Format jawaban Anda dalam bentuk poin-poin singkat dan jelas dalam Bahasa Indonesia.
    Contoh untuk pelanggaran: "1. Ajak siswa berbicara secara pribadi...", "2. Cari tahu akar masalah...", "3. Berikan konsekuensi yang mendidik...".
    Contoh untuk prestasi: "1. Berikan pujian tulus di depan kelas...", "2. Informasikan kepada orang tua...", "3. Jadikan contoh bagi siswa lain...".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 1,
        topK: 1
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Terjadi kesalahan saat mencoba mendapatkan saran dari AI. Silakan coba lagi nanti.";
  }
};