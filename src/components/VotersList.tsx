import React, { useMemo, useState } from 'react';
import { DesaSettings, Dusun, RT, RW, VerificationStatus, Voter, VoterEligibilityStatus } from '../types';
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  Filter,
  HelpCircle,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { EligibilityBadge, StatusBadge } from './StatusBadge';
import { formatDateToDisplay, formatDateToLong } from '../utils/dateUtils';

interface VotersListProps {
  voters: Voter[];
  dusuns?: Dusun[];
  rws: RW[];
  rts: RT[];
  settings?: DesaSettings;
  onAddVoter: () => void;
  onEditVoter: (voter: Voter) => void;
  onDeleteVoter: (voter: Voter) => void;
  onVerifyVoter: (voter: Voter) => void;
  onViewVoter: (voter: Voter) => void;
  onNavigate: (page: string) => void;
}

export const VotersList: React.FC<VotersListProps> = ({
  voters,
  dusuns = [],
  rws,
  rts,
  settings,
  onAddVoter,
  onEditVoter,
  onDeleteVoter,
  onVerifyVoter,
  onViewVoter,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDusunId, setSelectedDusunId] = useState('');
  const [selectedRw, setSelectedRw] = useState('');
  const [selectedRt, setSelectedRt] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedEligibility, setSelectedEligibility] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'alpha-asc' | 'alpha-desc' | 'age-desc' | 'age-asc'>('date-desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered RW options based on selected Dusun
  const availableRws = useMemo(() => {
    if (!selectedDusunId) return rws;
    return rws.filter((r) => r.dusunId === selectedDusunId);
  }, [selectedDusunId, rws]);

  // Filtered RT options based on selected RW
  const availableRts = useMemo(() => {
    if (!selectedRw) return rts;
    return rts.filter((r) => r.rwNomor === selectedRw);
  }, [selectedRw, rts]);

  // Filtered voters
  const filteredVoters = useMemo(() => {
    let result = [...voters];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (v) =>
          v.namaLengkap.toLowerCase().includes(q) ||
          v.alamat.toLowerCase().includes(q) ||
          (v.nik && v.nik.toLowerCase().includes(q)) ||
          (v.noKk && v.noKk.toLowerCase().includes(q)) ||
          (v.nomorIdentifikasiInternal && v.nomorIdentifikasiInternal.toLowerCase().includes(q)) ||
          (v.tempatLahir && v.tempatLahir.toLowerCase().includes(q))
      );
    }

    if (selectedDusunId) {
      result = result.filter((v) => v.dusunId === selectedDusunId);
    }

    if (selectedRw) {
      result = result.filter((v) => v.rw === selectedRw);
    }

    if (selectedRt) {
      result = result.filter((v) => v.rt === selectedRt);
    }

    if (selectedStatus) {
      result = result.filter((v) => v.statusVerifikasi === selectedStatus);
    }

    if (selectedEligibility) {
      result = result.filter((v) => v.kelayakanStatus === selectedEligibility);
    }

    if (selectedGender) {
      result = result.filter((v) => v.jenisKelamin === selectedGender);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'alpha-asc') {
        return a.namaLengkap.localeCompare(b.namaLengkap);
      }
      if (sortBy === 'alpha-desc') {
        return b.namaLengkap.localeCompare(a.namaLengkap);
      }
      if (sortBy === 'age-desc') {
        return (b.usiaPadaPilkades ?? -1) - (a.usiaPadaPilkades ?? -1);
      }
      if (sortBy === 'age-asc') {
        return (a.usiaPadaPilkades ?? 999) - (b.usiaPadaPilkades ?? 999);
      }
      return 0;
    });

    return result;
  }, [voters, search, selectedDusunId, selectedRw, selectedRt, selectedStatus, selectedEligibility, selectedGender, sortBy]);

  // Statistics bar counts
  const summaryCounts = useMemo(() => {
    return {
      total: voters.length,
      memenuhiSyarat: voters.filter((v) => v.kelayakanStatus === 'memenuhi_syarat_usia' || v.kelayakanStatus === 'terverifikasi').length,
      perluPemeriksaan: voters.filter((v) => v.kelayakanStatus === 'perlu_pemeriksaan').length,
      perluPerbaikan: voters.filter((v) => v.kelayakanStatus === 'perlu_perbaikan').length,
      belumDinilai: voters.filter((v) => v.kelayakanStatus === 'belum_dapat_dinilai').length,
    };
  }, [voters]);

  // Pagination
  const totalPages = Math.ceil(filteredVoters.length / pageSize) || 1;
  const paginatedVoters = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVoters.slice(start, start + pageSize);
  }, [filteredVoters, page, pageSize]);

  const handleExportExcel = () => {
    const exportData = filteredVoters.map((v, i) => ({
      'No.': i + 1,
      'NIK': v.nik || '-',
      'No. KK': v.noKk || '-',
      'Nama Lengkap': v.namaLengkap,
      'Tempat Lahir': v.tempatLahir || '-',
      'Tanggal Lahir': v.tanggalLahir ? formatDateToDisplay(v.tanggalLahir) : '-',
      'Usia pd Hari H': v.usiaPadaPilkades !== undefined ? `${v.usiaPadaPilkades} Tahun` : '-',
      'Jenis Kelamin': v.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-Laki',
      'Status Kawin':
        v.statusPerkawinan === 'S' ? 'Kawin (S)' : v.statusPerkawinan === 'P' ? 'Pernah Kawin (P)' : 'Belum Kawin (B)',
      'Dusun': v.dusunNama || '-',
      'RW': v.rw,
      'RT': v.rt,
      'Alamat Domisili': v.alamat,
      'Status Verifikasi':
        v.statusVerifikasi === 'sudah_diverifikasi'
          ? 'Sudah Diverifikasi'
          : v.statusVerifikasi === 'perlu_perbaikan'
          ? 'Perlu Perbaikan'
          : 'Belum Diverifikasi',
      'Kelayakan Usia':
        v.kelayakanStatus === 'terverifikasi'
          ? 'Terverifikasi (Sah)'
          : v.kelayakanStatus === 'memenuhi_syarat_usia'
          ? 'Memenuhi Syarat Usia'
          : v.kelayakanStatus === 'perlu_pemeriksaan'
          ? 'Perlu Pemeriksaan Kelayakan'
          : v.kelayakanStatus === 'perlu_perbaikan'
          ? 'Perlu Perbaikan Data'
          : 'Belum Dapat Dinilai',
      'Catatan Kelayakan': v.alasanKelayakan || '-',
      'No. Identifikasi': v.nomorIdentifikasiInternal || '-',
      'Keterangan': v.keterangan || '-',
      'Catatan Petugas': v.catatanVerifikasi || '-',
      'Diverifikasi Oleh': v.verifiedBy || '-',
      'Tanggal Input': new Date(v.createdAt).toLocaleDateString('id-ID'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DPT Pemilih');
    XLSX.writeFile(workbook, `DPT_Pilkades_${Date.now()}.xlsx`);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedDusunId('');
    setSelectedRw('');
    setSelectedRt('');
    setSelectedStatus('');
    setSelectedEligibility('');
    setSelectedGender('');
    setSortBy('date-desc');
    setPage(1);
  };

  const hasFilter = search || selectedDusunId || selectedRw || selectedRt || selectedStatus || selectedEligibility || selectedGender;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            <span>Daftar Calon Pemilih Tetap (DPT)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data kependudukan, NIK, kalkulasi usia pemilih pada hari H, dan validasi berkas hak pilih.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor Excel ({filteredVoters.length})</span>
          </button>
          <button
            onClick={onAddVoter}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pemilih</span>
          </button>
        </div>
      </div>

      {/* Warning Banner if election date is missing */}
      {!settings?.tanggalPelaksanaan && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-bold">Tanggal Pelaksanaan Pilkades Belum Ditentukan</p>
              <p className="text-[11px] text-amber-800">
                Kalkulasi usia pemilih dan penapisan hak suara memerlukan tanggal hari H pemungutan suara.
              </p>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold self-start sm:self-auto shrink-0 transition-colors"
            >
              Atur di Pengaturan Desa
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
          <span className="text-[10px] text-slate-500 block">Total Calon Pemilih</span>
          <span className="text-lg font-bold text-slate-900">{summaryCounts.total}</span>
        </div>
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-center shadow-2xs">
          <span className="text-[10px] text-emerald-800 block font-semibold">Memenuhi Syarat Usia</span>
          <span className="text-lg font-bold text-emerald-900">{summaryCounts.memenuhiSyarat}</span>
        </div>
        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-center shadow-2xs">
          <span className="text-[10px] text-amber-800 block font-semibold">Perlu Pemeriksaan</span>
          <span className="text-lg font-bold text-amber-900">{summaryCounts.perluPemeriksaan}</span>
        </div>
        <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 text-center shadow-2xs">
          <span className="text-[10px] text-rose-800 block font-semibold">Perlu Perbaikan Data</span>
          <span className="text-lg font-bold text-rose-900">{summaryCounts.perluPerbaikan}</span>
        </div>
        <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-300 text-center shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-600 block">Belum Dinilai</span>
          <span className="text-lg font-bold text-slate-800">{summaryCounts.belumDinilai}</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari berdasarkan NIK, No KK, nama, alamat, atau tempat lahir..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>

          {/* Quick Clear Filter */}
          {hasFilter && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 border-t border-slate-100">
          {/* Dusun Filter */}
          {dusuns.length > 0 && (
            <div>
              <select
                value={selectedDusunId}
                onChange={(e) => {
                  setSelectedDusunId(e.target.value);
                  setSelectedRw('');
                  setSelectedRt('');
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="">Semua Dusun</option>
                {dusuns.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* RW Filter */}
          <div>
            <select
              value={selectedRw}
              onChange={(e) => {
                setSelectedRw(e.target.value);
                setSelectedRt('');
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="">Semua RW</option>
              {availableRws.map((rw) => (
                <option key={rw.id} value={rw.nomor}>
                  RW {rw.nomor}
                </option>
              ))}
            </select>
          </div>

          {/* RT Filter */}
          <div>
            <select
              value={selectedRt}
              onChange={(e) => {
                setSelectedRt(e.target.value);
                setPage(1);
              }}
              disabled={!selectedRw}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 disabled:bg-slate-100"
            >
              <option value="">Semua RT</option>
              {availableRts.map((rt) => (
                <option key={rt.id} value={rt.nomor}>
                  RT {rt.nomor}
                </option>
              ))}
            </select>
          </div>

          {/* Kelayakan Usia Filter */}
          <div>
            <select
              value={selectedEligibility}
              onChange={(e) => {
                setSelectedEligibility(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="">Semua Kelayakan Usia</option>
              <option value="memenuhi_syarat_usia">Memenuhi Syarat Usia</option>
              <option value="perlu_pemeriksaan">Perlu Pemeriksaan (Usia &lt; 17)</option>
              <option value="terverifikasi">Terverifikasi Sah</option>
              <option value="perlu_perbaikan">Perlu Perbaikan</option>
              <option value="belum_dapat_dinilai">Belum Dapat Dinilai</option>
            </select>
          </div>

          {/* Status Verifikasi Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="">Semua Verifikasi</option>
              <option value="sudah_diverifikasi">Sudah Diverifikasi</option>
              <option value="belum_diverifikasi">Belum Diverifikasi</option>
              <option value="perlu_perbaikan">Perlu Perbaikan</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 font-medium"
            >
              <option value="date-desc">Terbaru Ditambahkan</option>
              <option value="date-asc">Terlama Ditambahkan</option>
              <option value="alpha-asc">Nama A &rarr; Z</option>
              <option value="alpha-desc">Nama Z &rarr; A</option>
              <option value="age-desc">Usia Tertua</option>
              <option value="age-asc">Usia Termuda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Voters Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3.5 w-10 text-center">No</th>
                <th className="py-3 px-3.5">Identitas & NIK</th>
                <th className="py-3 px-3.5">Kelahiran & Usia Hari H</th>
                <th className="py-3 px-3.5 text-center">JK / Status</th>
                <th className="py-3 px-3.5">Wilayah & Alamat</th>
                <th className="py-3 px-3.5 text-center">Kelayakan Usia</th>
                <th className="py-3 px-3.5 text-center">Status Verifikasi</th>
                <th className="py-3 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedVoters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">Tidak ada data pemilih yang sesuai</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba ubah kata kunci pencarian atau sesuaikan filter wilayah di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedVoters.map((voter, idx) => {
                  const globalIdx = (page - 1) * pageSize + idx + 1;
                  const isUnderage = voter.usiaPadaPilkades !== undefined && voter.usiaPadaPilkades < 17;

                  return (
                    <tr
                      key={voter.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-3 px-3.5 text-center font-mono text-slate-400 text-[11px]">
                        {globalIdx}
                      </td>

                      {/* Identitas & NIK */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {voter.namaLengkap}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 mt-0.5">
                          <span>{voter.nik ? voter.nik : '(NIK belum terisi)'}</span>
                          {voter.nomorIdentifikasiInternal && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]">
                              {voter.nomorIdentifikasiInternal}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kelahiran & Usia */}
                      <td className="py-3 px-3.5">
                        <div className="text-slate-800">
                          {voter.tempatLahir ? `${voter.tempatLahir}, ` : ''}
                          <span className="font-medium">
                            {voter.tanggalLahir ? formatDateToDisplay(voter.tanggalLahir) : '-'}
                          </span>
                        </div>
                        <div className="mt-0.5">
                          {voter.usiaPadaPilkades !== undefined ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                isUnderage
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {voter.usiaPadaPilkades} Tahun
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum dihitung</span>
                          )}
                        </div>
                      </td>

                      {/* JK & Status Kawin */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex items-center gap-1 text-[11px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              voter.jenisKelamin === 'P'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {voter.jenisKelamin || 'L'}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold"
                            title={
                              voter.statusPerkawinan === 'S'
                                ? 'Sudah Kawin'
                                : voter.statusPerkawinan === 'P'
                                ? 'Pernah Kawin'
                                : 'Belum Kawin'
                            }
                          >
                            {voter.statusPerkawinan || 'B'}
                          </span>
                        </div>
                      </td>

                      {/* Wilayah & Alamat */}
                      <td className="py-3 px-3.5 max-w-xs">
                        <div className="font-semibold text-slate-800">
                          {voter.dusunNama ? `${voter.dusunNama} • ` : ''}
                          <span className="font-mono">RT {voter.rt} / RW {voter.rw}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={voter.alamat}>
                          {voter.alamat}
                        </div>
                      </td>

                      {/* Status Kelayakan Usia */}
                      <td className="py-3 px-3.5 text-center">
                        <EligibilityBadge status={voter.kelayakanStatus} size="sm" />
                      </td>

                      {/* Status Verifikasi */}
                      <td className="py-3 px-3.5 text-center">
                        <StatusBadge status={voter.statusVerifikasi} size="sm" />
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewVoter(voter)}
                            title="Lihat Detail Pemilih"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onVerifyVoter(voter)}
                            title="Verifikasi Administrasi"
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditVoter(voter)}
                            title="Ubah Data"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteVoter(voter)}
                            title="Hapus Pemilih"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-900">
              {filteredVoters.length === 0 ? 0 : (page - 1) * pageSize + 1}
            </strong>{' '}
            -{' '}
            <strong className="text-slate-900">
              {Math.min(page * pageSize, filteredVoters.length)}
            </strong>{' '}
            dari <strong className="text-slate-900">{filteredVoters.length}</strong> data pemilih
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-mono text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
