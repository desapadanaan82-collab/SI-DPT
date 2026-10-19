import React, { useRef, useState } from 'react';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Download,
  RotateCcw,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { ConfirmDialog } from './modals/ConfirmDialog';

interface BackupRestoreProps {
  onRefreshAll: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onRefreshAll }) => {
  const { currentUser, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [resetModalOpen, setResetModalOpen] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Akses Terbatas</h3>
        <p className="text-xs text-slate-500 mt-1">
          Hanya Administrator yang memiliki wewenang untuk mencadangkan atau memulihkan basis data.
        </p>
      </div>
    );
  }

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_DPT_Pilkades_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setFeedback({
      type: 'success',
      message: 'Berkas cadangan basis data berhasil diunduh ke komputer Anda.',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const res = StorageService.restoreBackup(content, currentUser);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        onRefreshAll();
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetConfirm = () => {
    if (!currentUser) return;
    StorageService.resetToDefault(currentUser);
    setResetModalOpen(false);
    setFeedback({
      type: 'success',
      message: 'Basis data berhasil direset ke konfigurasi contoh bawaan.',
    });
    onRefreshAll();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Archive className="w-5 h-5 text-emerald-800" />
          <span>Pencadangan & Pemulihan Basis Data (Backup & Restore)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Amankan seluruh data DPT, wilayah RT/RW, Dusun, riwayat verifikasi, dan pengaturan desa ke
          dalam satu berkas terenkripsi aman.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Backup */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Download className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Unduh Cadangan Basis Data (Backup)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mengekspor seluruh tabel (Dusun, RW, RT, Data Pemilih, Pengguna, Log Audit, dan
              Pengaturan) ke dalam format berkas JSON terstruktur yang dapat disimpan di komputer
              atau flashdisk.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File Cadangan Sekarang</span>
          </button>
        </div>

        {/* Card 2: Restore */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Pulihkan Basis Data (Restore)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Memulihkan kembali seluruh data aplikasi dari berkas cadangan JSON yang telah diunduh
              sebelumnya. Berguna saat berpindah komputer atau memulihkan data pleno sebelumnya.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih Berkas Cadangan (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset to Default */}
      <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-200 space-y-3">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
          <RotateCcw className="w-4 h-4 text-rose-700" />
          <span>Reset ke Data Bawaan Sistem</span>
        </div>
        <p className="text-xs text-rose-800 leading-relaxed max-w-2xl">
          Tindakan ini akan mengembalikan data Dusun, RW, RT, pemilih contoh, dan pengaturan desa
          kembali ke konfigurasi awal. Harap lakukan pencadangan sebelum melanjutkan.
        </p>
        <button
          onClick={() => setResetModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors"
        >
          Reset Seluruh Data
        </button>
      </div>

      <ConfirmDialog
        isOpen={resetModalOpen}
        title="Konfirmasi Reset Basis Data"
        message="Apakah Anda yakin ingin mereset seluruh data aplikasi ke contoh bawaan? Seluruh perubahan data warga dan wilayah saat ini akan ditimpa."
        confirmLabel="Ya, Reset Data"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleResetConfirm}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
};
