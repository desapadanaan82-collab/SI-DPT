import React from 'react';
import { DesaSettings, Voter } from '../../types';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  FileText,
  MapPin,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { EligibilityBadge, StatusBadge } from '../StatusBadge';
import { formatDateToDisplay, formatDateToLong } from '../../utils/dateUtils';

interface VoterDetailModalProps {
  isOpen: boolean;
  voter: Voter | null;
  settings?: DesaSettings;
  onClose: () => void;
  onEdit: (voter: Voter) => void;
  onVerify: (voter: Voter) => void;
  onDelete: (voter: Voter) => void;
}

export const VoterDetailModal: React.FC<VoterDetailModalProps> = ({
  isOpen,
  voter,
  settings,
  onClose,
  onEdit,
  onVerify,
  onDelete,
}) => {
  if (!isOpen || !voter) return null;

  const handlePrint = () => {
    window.print();
  };

  const maritalLabel =
    voter.statusPerkawinan === 'S'
      ? 'Kawin (S)'
      : voter.statusPerkawinan === 'P'
      ? 'Pernah Kawin / Cerai (P)'
      : 'Belum Kawin (B)';

  const genderLabel = voter.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-Laki';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shadow-xs">
              <User className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{voter.namaLengkap}</h3>
              <p className="text-xs text-slate-500 font-mono">
                {voter.nik ? `NIK: ${voter.nik}` : `ID Sistem: ${voter.id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status badges bar */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 block">Status Pemeriksaan:</span>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={voter.statusVerifikasi} />
              <EligibilityBadge status={voter.kelayakanStatus} />
            </div>
          </div>

          {voter.usiaPadaPilkades !== undefined && (
            <div className="sm:text-right">
              <span className="text-[10px] text-slate-500 block">Usia pada Hari H:</span>
              <span className="text-sm font-bold text-emerald-800 font-mono">
                {voter.usiaPadaPilkades} Tahun
              </span>
            </div>
          )}
        </div>

        {/* Legal Disclaimer Box */}
        {voter.alasanKelayakan && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Indikasi Penilaian Sistem (Peraturan Pilkades):</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">{voter.alasanKelayakan}</p>
            <p className="text-[10px] text-amber-700 leading-normal italic pt-1 border-t border-amber-200/50">
              * Perhitungan usia adalah penapisan awal berdasarkan Peraturan Pilkades (termasuk Perbup Sumedang). Keputusan akhir hak pilih ditetapkan sah melalui Berita Acara Pleno Panitia Pemilihan.
            </p>
          </div>
        )}

        {/* Demographic & Address Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 text-[11px] block mb-0.5">Nomor Induk Kependudukan (NIK)</span>
            <span className="font-mono font-bold text-slate-800 text-xs">
              {voter.nik || '(Belum Tercatat)'}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 text-[11px] block mb-0.5">Nomor Kartu Keluarga (KK)</span>
            <span className="font-mono font-bold text-slate-800 text-xs">
              {voter.noKk || '(Belum Tercatat)'}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 text-[11px] block mb-0.5">Tempat & Tanggal Lahir</span>
            <span className="font-semibold text-slate-800">
              {voter.tempatLahir ? `${voter.tempatLahir}, ` : ''}
              {voter.tanggalLahir ? formatDateToLong(voter.tanggalLahir) : '(Belum Diisi)'}
            </span>
            {voter.tanggalLahir && (
              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                Format: {formatDateToDisplay(voter.tanggalLahir)}
              </span>
            )}
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 text-[11px] block mb-0.5">Jenis Kelamin & Status Kawin</span>
            <span className="font-semibold text-slate-800">
              {genderLabel} &bull; {maritalLabel}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 text-[11px] block mb-0.5">Wilayah Domisili</span>
            <span className="font-bold text-slate-800 text-xs">
              {voter.dusunNama ? `${voter.dusunNama} — ` : ''}RT {voter.rt} / RW {voter.rw}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 text-[11px] block mb-0.5">Penetapan TPS</span>
            <span className="font-bold text-emerald-800 text-xs">
              {voter.tpsNomor ? `TPS ${voter.tpsNomor}` : 'Belum Ditetapkan'}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 text-[11px] block mb-0.5">Hari H Pilkades</span>
            <span className="font-semibold text-emerald-800">
              {settings?.tanggalPelaksanaan ? formatDateToLong(settings.tanggalPelaksanaan) : 'Belum Ditentukan'}
            </span>
          </div>

          <div className="col-span-2 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 text-[11px] block mb-0.5">Alamat Lengkap</span>
            <span className="font-semibold text-slate-800 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{voter.alamat}</span>
            </span>
          </div>

          {voter.nomorIdentifikasiInternal && (
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
              <span className="text-slate-400 text-[11px] block mb-0.5">No. Induk / Buku DPT</span>
              <span className="font-mono font-bold text-slate-800">
                {voter.nomorIdentifikasiInternal}
              </span>
            </div>
          )}

          {voter.keterangan && (
            <div className={`${voter.nomorIdentifikasiInternal ? '' : 'col-span-2'} p-3 rounded-xl border border-slate-100 bg-slate-50/60`}>
              <span className="text-slate-400 text-[11px] block mb-0.5">Keterangan Tambahan</span>
              <span className="text-slate-700 italic">{voter.keterangan}</span>
            </div>
          )}

          {voter.catatanVerifikasi && (
            <div className="col-span-2 p-3 rounded-xl border border-emerald-100 bg-emerald-50/60">
              <span className="text-emerald-800 font-bold block mb-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Catatan Verifikasi Panitia
              </span>
              <p className="text-slate-700 text-xs">{voter.catatanVerifikasi}</p>
              {voter.verifiedBy && (
                <div className="text-[10px] text-emerald-800/80 mt-1">
                  Diverifikasi oleh: <strong>{voter.verifiedBy}</strong>{' '}
                  {voter.verifiedAt &&
                    `pada ${new Date(voter.verifiedAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Data</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(voter);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onVerify(voter);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Verifikasi</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(voter);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
