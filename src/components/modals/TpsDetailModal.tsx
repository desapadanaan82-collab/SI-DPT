import React, { useMemo, useState } from 'react';
import { TPS, Voter } from '../../types';
import { maskNik, maskKk, formatDateToDisplay } from '../../utils/dateUtils';
import { TpsMap } from '../TpsMap';
import {
  Building,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Phone,
  Search,
  UserCheck,
  Users,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface TpsDetailModalProps {
  isOpen: boolean;
  tps: TPS | null;
  voters: Voter[];
  onClose: () => void;
  onEdit: (tps: TPS) => void;
  onOpenAssign: (tps: TPS) => void;
}

export const TpsDetailModal: React.FC<TpsDetailModalProps> = ({
  isOpen,
  tps,
  voters,
  onClose,
  onEdit,
  onOpenAssign,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'L' | 'P'>('all');

  const tpsVoters = useMemo(() => {
    if (!tps) return [];
    return voters.filter((v) => v.tpsId === tps.id);
  }, [tps, voters]);

  const stats = useMemo(() => {
    const total = tpsVoters.length;
    const l = tpsVoters.filter((v) => v.jenisKelamin === 'L').length;
    const p = tpsVoters.filter((v) => v.jenisKelamin === 'P').length;
    const verified = tpsVoters.filter((v) => v.statusVerifikasi === 'sudah_diverifikasi').length;
    const quota = tps ? (tps.kapasitas || 300) : 300;
    const remaining = Math.max(0, quota - total);
    const percentage = quota > 0 ? Math.min(100, Math.round((total / quota) * 100)) : 0;

    return { total, l, p, verified, quota, remaining, percentage };
  }, [tpsVoters, tps]);

  const filteredVoters = useMemo(() => {
    return tpsVoters.filter((v) => {
      if (genderFilter !== 'all' && v.jenisKelamin !== genderFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.namaLengkap.toLowerCase().includes(q) ||
        (v.nik && v.nik.includes(q)) ||
        (v.alamat && v.alamat.toLowerCase().includes(q)) ||
        v.rt.includes(q) ||
        v.rw.includes(q)
      );
    });
  }, [tpsVoters, genderFilter, searchQuery]);

  if (!isOpen || !tps) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${tps.latitude},${tps.longitude}`;

  const exportExcel = () => {
    const rows = tpsVoters.map((v, i) => ({
      No: i + 1,
      'No. TPS': tps.nomor,
      'Nama Pemilih': v.namaLengkap,
      NIK: v.nik ? maskNik(v.nik) : '-',
      KK: v.noKk ? maskKk(v.noKk) : '-',
      JK: v.jenisKelamin || '-',
      'Tempat Lahir': v.tempatLahir || '-',
      'Tgl Lahir': formatDateToDisplay(v.tanggalLahir),
      'Usia (Hari H)': v.usiaPadaPilkades || '-',
      'Status Kawin': v.statusPerkawinan || '-',
      Alamat: v.alamat,
      RT: v.rt,
      RW: v.rw,
      Dusun: v.dusunNama || '-',
      'Status Verifikasi': v.statusVerifikasi,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `DPT_TPS_${tps.nomor}`);
    XLSX.writeFile(wb, `DPT_Pilkades_TPS_${tps.nomor}_Padanaan.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/70 rounded-xl">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/20 text-white uppercase tracking-wider">
                  TPS {tps.nomor}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 font-semibold border border-emerald-400/40">
                  {tps.status === 'ditetapkan' ? 'Ditetapkan' : tps.status === 'usulan' ? 'Usulan' : 'Rancangan'}
                </span>
              </div>
              <h3 className="font-bold text-lg leading-tight mt-0.5">{tps.nama}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Top Grid: Info & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Info details (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Lokasi Fisik</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{tps.namaTempat || '-'}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Wilayah Cakupan</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {tps.dusunNama || 'Semua Dusun'} (RW {tps.rw || '-'} / RT {tps.rt || '-'})
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-xs">
                  <span className="font-bold text-slate-600">Alamat:</span>{' '}
                  <span className="text-slate-800">{tps.alamat || '-'}</span>
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-600">Aksesibilitas:</span>{' '}
                  <span className="text-emerald-800 font-semibold">{tps.aksesibilitas || 'Standar'}</span>
                </div>
                {(tps.namaKetuaKpks || tps.kontakPetugas) && (
                  <div className="text-xs flex items-center gap-2 pt-1 border-t border-slate-200">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-700">
                      Petugas KPPS: <strong>{tps.namaKetuaKpks || '-'}</strong> ({tps.kontakPetugas || 'Tanpa kontak'})
                    </span>
                  </div>
                )}
                {tps.keterangan && (
                  <div className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                    &ldquo;{tps.keterangan}&rdquo;
                  </div>
                )}
              </div>

              {/* Statistical Progress Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Total Pemilih</span>
                  <p className="text-xl font-extrabold text-emerald-950 mt-0.5">{stats.total}</p>
                  <span className="text-[10px] text-emerald-700 font-medium">dari {stats.quota} kuota ({stats.percentage}%)</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-blue-800 uppercase">Laki-Laki (L)</span>
                  <p className="text-xl font-extrabold text-blue-950 mt-0.5">{stats.l}</p>
                  <span className="text-[10px] text-blue-700 font-medium">pemilih</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <span className="text-[10px] font-bold text-purple-800 uppercase">Perempuan (P)</span>
                  <p className="text-xl font-extrabold text-purple-950 mt-0.5">{stats.p}</p>
                  <span className="text-[10px] text-purple-700 font-medium">pemilih</span>
                </div>
              </div>
            </div>

            {/* Map Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Lokasi Peta & Rute</span>
                </span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1"
                >
                  <span>Buka di Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <TpsMap tpsList={[tps]} height="220px" />
              <div className="text-[11px] font-mono text-slate-500 text-right">
                Lat: {tps.latitude}, Lng: {tps.longitude}
              </div>
            </div>
          </div>

          {/* Bottom Table: Assigned Voters List */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Daftar Pemilih Terdaftar di TPS Ini ({tpsVoters.length} Orang)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Data NIK dan nomor identitas disamarkan untuk perlindungan data pribadi (UU PDP).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportExcel}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ekspor Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAssign(tps)}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Alokasi Pemilih</span>
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pemilih di TPS ini (nama, alamat, RT/RW)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
              >
                <option value="all">Semua Jenis Kelamin</option>
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            {/* Voters Mini Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3 w-10">No</th>
                    <th className="py-2 px-3">Nama Pemilih</th>
                    <th className="py-2 px-3">NIK (Disamarkan)</th>
                    <th className="py-2 px-3 w-14">JK</th>
                    <th className="py-2 px-3">RT/RW</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVoters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                        Belum ada pemilih yang dialokasikan ke TPS ini atau pencarian tidak sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredVoters.map((v, idx) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{v.namaLengkap}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{maskNik(v.nik)}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              v.jenisKelamin === 'L'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {v.jenisKelamin || '-'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">RT {v.rt} / RW {v.rw}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              v.statusVerifikasi === 'sudah_diverifikasi'
                                ? 'bg-emerald-100 text-emerald-800'
                                : v.statusVerifikasi === 'perlu_perbaikan'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {v.statusVerifikasi === 'sudah_diverifikasi'
                              ? 'Terverifikasi'
                              : v.statusVerifikasi === 'perlu_perbaikan'
                              ? 'Perlu Perbaikan'
                              : 'Belum Diverifikasi'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              ID TPS: <span className="font-mono">{tps.id}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(tps);
                }}
                className="px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 border border-emerald-300 rounded-xl transition"
              >
                Edit Data TPS
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
