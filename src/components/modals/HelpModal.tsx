import React from 'react';
import { HelpCircle, Shield, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Pedoman Aplikasi Sistem Informasi DPT Pilkades
              </h3>
              <p className="text-[11px] text-slate-500">
                Panduan Operasional Panitia Pemilihan Kepala Desa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-1">1. Alur Pemutakhiran Data Pemilih</h4>
            <p>
              Data pemilih diawali dari Daftar Pemilih Sementara (DPS), diverifikasi secara bertahap
              oleh petugas lapangan bersama RT/RW, dan ditetapkan menjadi Daftar Pemilih Tetap (DPT)
              melalui Rapat Pleno Panitia Pilkades.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">2. Pengelolaan Wilayah Dusun, RW & RT</h4>
            <p>
              Wilayah dikelompokkan hierarkis: Dusun membawahi RW, dan RW membawahi RT. Tombol{' '}
              <span className="font-semibold text-slate-800">Ubah</span> dapat digunakan kapan saja
              untuk memperbarui nama tanpa merusak data pemilih. Tombol{' '}
              <span className="font-semibold text-slate-800">Hapus</span> hanya dapat digunakan jika
              wilayah tersebut sudah bebas dari sub-wilayah dan tidak ada pemilih terdaftar.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">3. Status Verifikasi Data</h4>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>
                <span className="font-semibold text-emerald-700">Sudah Diverifikasi:</span> Berkas
                sesuai KTP/KK, berdomisili sah, dan memenuhi syarat usia/status.
              </li>
              <li>
                <span className="font-semibold text-rose-700">Perlu Perbaikan:</span> Ditemukan
                perbedaan alamat, penulisan nama, atau tercatat di RT tetangga.
              </li>
              <li>
                <span className="font-semibold text-amber-700">Belum Diverifikasi:</span> Data baru
                diinput atau diimpor yang menunggu verifikasi lapangan.
              </li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">4. Cadangan Data & Ekspor Berkas</h4>
            <p>
              Panitia disarankan untuk melakukan pencadangan berkala melalui menu Cadangan & Pemulihan
              (Backup) serta mencetak Berita Acara dan Rekapitulasi Resmi dalam format PDF / Excel.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg"
          >
            Tutup Pedoman
          </button>
        </div>
      </div>
    </div>
  );
};
