import React, { useEffect, useState } from 'react';
import { DesaSettings, VerificationStatus, Voter } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import { EligibilityBadge } from '../StatusBadge';
import { formatDateToLong } from '../../utils/dateUtils';

interface VerifyVoterModalProps {
  isOpen: boolean;
  voter: Voter | null;
  settings?: DesaSettings;
  onClose: () => void;
  onSuccess: (voter: Voter, message: string) => void;
}

export const VerifyVoterModal: React.FC<VerifyVoterModalProps> = ({
  isOpen,
  voter,
  settings,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>('sudah_diverifikasi');
  const [catatan, setCatatan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (voter) {
      setStatus(voter.statusVerifikasi || 'sudah_diverifikasi');
      setCatatan(voter.catatanVerifikasi || '');
      setErrorMsg('');
    }
  }, [voter]);

  if (!isOpen || !voter) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg('');

    try {
      const updated = StorageService.updateVerification(
        voter.id,
        status,
        catatan.trim() || undefined,
        currentUser
      );

      if (updated) {
        onSuccess(
          updated,
          `Status verifikasi "${updated.namaLengkap}" berhasil diubah menjadi ${
            status === 'sudah_diverifikasi'
              ? 'Sudah Diverifikasi'
              : status === 'perlu_perbaikan'
              ? 'Perlu Perbaikan'
              : 'Belum Diverifikasi'
          }.`
        );
        onClose();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  const maritalLabel =
    voter.statusPerkawinan === 'S'
      ? 'Kawin (S)'
      : voter.statusPerkawinan === 'P'
      ? 'Pernah Kawin (P)'
      : 'Belum Kawin (B)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <UserCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Verifikasi Kelayakan Calon Pemilih</h3>
              <p className="text-[11px] text-slate-500">{voter.namaLengkap}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Voter Summary Card */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 text-[10px] block">NIK:</span>
              <span className="font-mono font-bold text-slate-800">{voter.nik || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Wilayah:</span>
              <span className="font-semibold text-slate-800">
                {voter.dusunNama ? `${voter.dusunNama}, ` : ''}RT {voter.rt} / RW {voter.rw}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Tanggal Lahir:</span>
              <span className="font-semibold text-slate-800">
                {voter.tanggalLahir ? formatDateToLong(voter.tanggalLahir) : '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Status Kawin:</span>
              <span className="font-semibold text-slate-800">{maritalLabel}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Penilaian Sistem:</span>
            <div className="flex items-center gap-2">
              {voter.usiaPadaPilkades !== undefined && (
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                  {voter.usiaPadaPilkades} Tahun
                </span>
              )}
              <EligibilityBadge status={voter.kelayakanStatus} size="sm" />
            </div>
          </div>

          {voter.alasanKelayakan && (
            <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
              {voter.alasanKelayakan}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Pilih Penetapan Status Verifikasi:
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                  status === 'sudah_diverifikasi'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="verif_status"
                  value="sudah_diverifikasi"
                  checked={status === 'sudah_diverifikasi'}
                  onChange={() => setStatus('sudah_diverifikasi')}
                  className="mt-0.5 text-emerald-700 focus:ring-emerald-700"
                />
                <div>
                  <span className="block font-bold text-emerald-900">Sudah Diverifikasi (Sah)</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Kesesuaian berkas identitas lengkap, domisili sah, dan memenuhi syarat usia atau perkawinan.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                  status === 'perlu_perbaikan'
                    ? 'border-rose-500 bg-rose-50 text-rose-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="verif_status"
                  value="perlu_perbaikan"
                  checked={status === 'perlu_perbaikan'}
                  onChange={() => setStatus('perlu_perbaikan')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-600"
                />
                <div>
                  <span className="block font-bold text-rose-900">Perlu Perbaikan Data</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Ada kekeliruan NIK, alamat, RT/RW, atau dokumen kependudukan yang harus diperbaiki.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                  status === 'belum_diverifikasi'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="verif_status"
                  value="belum_diverifikasi"
                  checked={status === 'belum_diverifikasi'}
                  onChange={() => setStatus('belum_diverifikasi')}
                  className="mt-0.5 text-amber-600 focus:ring-amber-600"
                />
                <div>
                  <span className="block font-bold text-amber-900">Belum Diverifikasi</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Menunggu pemeriksaan faktual atau pengecekan lapangan oleh petugas KPPS / Panitia.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Hasil Verifikasi & Dasar Pertimbangan Panitia:
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Berkas KTP-el dan KK telah dicocokkan dengan buku induk RT 001. Memenuhi syarat hak suara."
              rows={3}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              Simpan Hasil Verifikasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
