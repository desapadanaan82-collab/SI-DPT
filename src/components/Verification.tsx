import React, { useMemo, useState } from 'react';
import { DesaSettings, Dusun, RW, VerificationStatus, Voter, VoterEligibilityStatus } from '../types';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  Filter,
  HelpCircle,
  Info,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { EligibilityBadge, StatusBadge } from './StatusBadge';
import { formatDateToDisplay, formatDateToLong } from '../utils/dateUtils';

interface VerificationProps {
  voters: Voter[];
  dusuns?: Dusun[];
  rws: RW[];
  settings?: DesaSettings;
  onVerifyVoter: (voter: Voter) => void;
  onViewVoter: (voter: Voter) => void;
}

export const Verification: React.FC<VerificationProps> = ({
  voters,
  dusuns = [],
  rws,
  settings,
  onVerifyVoter,
  onViewVoter,
}) => {
  const [activeTab, setActiveTab] = useState<VoterEligibilityStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedRw, setSelectedRw] = useState('');
  const [selectedDusunId, setSelectedDusunId] = useState('');

  const counts = useMemo(() => {
    return {
      all: voters.length,
      terverifikasi: voters.filter((v) => v.kelayakanStatus === 'terverifikasi').length,
      memenuhi_syarat_usia: voters.filter((v) => v.kelayakanStatus === 'memenuhi_syarat_usia').length,
      perlu_pemeriksaan: voters.filter((v) => v.kelayakanStatus === 'perlu_pemeriksaan').length,
      perlu_perbaikan: voters.filter((v) => v.kelayakanStatus === 'perlu_perbaikan').length,
      belum_dapat_dinilai: voters.filter((v) => v.kelayakanStatus === 'belum_dapat_dinilai').length,
    };
  }, [voters]);

  const filteredVoters = useMemo(() => {
    return voters.filter((v) => {
      if (activeTab !== 'all' && v.kelayakanStatus !== activeTab) return false;
      if (selectedDusunId && v.dusunId !== selectedDusunId) return false;
      if (selectedRw && v.rw !== selectedRw) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          v.namaLengkap.toLowerCase().includes(q) ||
          v.alamat.toLowerCase().includes(q) ||
          (v.nik && v.nik.toLowerCase().includes(q)) ||
          (v.catatanVerifikasi && v.catatanVerifikasi.toLowerCase().includes(q)) ||
          (v.alasanKelayakan && v.alasanKelayakan.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [voters, activeTab, selectedDusunId, selectedRw, search]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-800" />
            <span>Pemeriksaan Kelayakan & Verifikasi Calon Pemilih</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemeriksaan otomatis usia pada hari pelaksanaan Pilkades, validasi status perkawinan, dan penetapan sah DPT oleh Panitia.
          </p>
        </div>

        {settings?.tanggalPelaksanaan && (
          <div className="px-3.5 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shrink-0">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>
              Hari H: <strong>{formatDateToLong(settings.tanggalPelaksanaan)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Peraturan Pilkades Box (Ketentuan Regulasi) */}
      <div className="p-4 bg-emerald-900 text-white rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Dasar Ketentuan Penilaian Pemilih Pilkades (Peraturan Daerah & Perbup Sumedang)</span>
        </div>
        <p className="text-xs text-emerald-100/90 leading-relaxed">
          Hak memilih diberikan kepada WNI yang terdaftar berdomisili di desa sekurang-kurangnya 6 bulan berturut-turut sebelum DPS diumumkan, dan <strong>telah genap berusia 17 (tujuh belas) tahun</strong> pada hari pemungutan suara atau <strong>sudah/pernah kawin</strong>.
        </p>
        <p className="text-[11px] text-emerald-200/80 italic border-t border-emerald-800/80 pt-1.5">
          * Catatan Hukum: Hasil perhitungan usia sistem merupakan indikasi awal. Panitia pemilihan berwenang memverifikasi dokumen fisik asli (KTP-el/KK/Buku Nikah) sebelum pengesahan final dalam Rapat Pleno DPT. Tidak ada pemilih yang dibatalkan secara sepihak tanpa verifikasi faktual.
        </p>
      </div>

      {/* 5 Status Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Semua Data</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold font-mono">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('perlu_pemeriksaan')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'perlu_pemeriksaan'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-amber-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>Perlu Pemeriksaan Kelayakan</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold font-mono">
            {counts.perlu_pemeriksaan}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('memenuhi_syarat_usia')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'memenuhi_syarat_usia'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-700 hover:bg-teal-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-teal-300" />
          <span>Memenuhi Persyaratan Usia</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold font-mono">
            {counts.memenuhi_syarat_usia}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('terverifikasi')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'terverifikasi'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-emerald-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Terverifikasi (Sah)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold font-mono">
            {counts.terverifikasi}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('perlu_perbaikan')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'perlu_perbaikan'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-rose-50'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-rose-300" />
          <span>Perlu Perbaikan Data</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold font-mono">
            {counts.perlu_perbaikan}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('belum_dapat_dinilai')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'belum_dapat_dinilai'
              ? 'bg-slate-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Belum Dapat Dinilai</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-bold font-mono">
            {counts.belum_dapat_dinilai}
          </span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan NIK, nama pemilih, atau alasan kelayakan..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
          />
        </div>

        {dusuns.length > 0 && (
          <select
            value={selectedDusunId}
            onChange={(e) => setSelectedDusunId(e.target.value)}
            className="w-full sm:w-44 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700"
          >
            <option value="">Semua Dusun</option>
            {dusuns.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama}
              </option>
            ))}
          </select>
        )}

        <select
          value={selectedRw}
          onChange={(e) => setSelectedRw(e.target.value)}
          className="w-full sm:w-36 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700"
        >
          <option value="">Semua RW</option>
          {rws.map((rw) => (
            <option key={rw.id} value={rw.nomor}>
              RW {rw.nomor}
            </option>
          ))}
        </select>
      </div>

      {/* List Cards of Voters for Verification */}
      <div className="space-y-3">
        {filteredVoters.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Tidak ada data pemilih pada kategori ini</h4>
            <p className="text-xs text-slate-400 mt-0.5">Semua data pada tab ini telah diperiksa atau tidak ditemukan.</p>
          </div>
        ) : (
          filteredVoters.map((voter) => {
            const isUnderage = voter.usiaPadaPilkades !== undefined && voter.usiaPadaPilkades < 17;
            const isMarried = voter.statusPerkawinan === 'S' || voter.statusPerkawinan === 'P';

            return (
              <div
                key={voter.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{voter.namaLengkap}</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      NIK: {voter.nik || '(Belum terisi)'}
                    </span>
                    <EligibilityBadge status={voter.kelayakanStatus} size="sm" />
                    <StatusBadge status={voter.statusVerifikasi} size="sm" />
                  </div>

                  {/* Demographic & Age Row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Tgl Lahir:</span>
                      <strong className="text-slate-800">
                        {voter.tanggalLahir ? formatDateToDisplay(voter.tanggalLahir) : '-'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Usia Hari H:</span>
                      <strong
                        className={`font-bold px-1.5 py-0.2 rounded ${
                          isUnderage ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {voter.usiaPadaPilkades !== undefined ? `${voter.usiaPadaPilkades} Tahun` : 'Belum dihitung'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Status Kawin:</span>
                      <strong className="text-slate-800">
                        {voter.statusPerkawinan === 'S'
                          ? 'Kawin'
                          : voter.statusPerkawinan === 'P'
                          ? 'Pernah Kawin'
                          : 'Belum Kawin'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Wilayah:</span>
                      <strong className="text-slate-800">
                        {voter.dusunNama ? `${voter.dusunNama}, ` : ''}RT {voter.rt} / RW {voter.rw}
                      </strong>
                    </div>
                  </div>

                  {/* Alasan Kelayakan Sistem */}
                  {voter.alasanKelayakan && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-[11px]">{voter.alasanKelayakan}</p>
                    </div>
                  )}

                  {/* Catatan Verifikasi Jika Ada */}
                  {voter.catatanVerifikasi && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <strong>Catatan Petugas:</strong> {voter.catatanVerifikasi}{' '}
                      {voter.verifiedBy && `(${voter.verifiedBy})`}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => onViewVoter(voter)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>

                  <button
                    onClick={() => onVerifyVoter(voter)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verifikasi</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
