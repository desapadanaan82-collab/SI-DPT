import React, { useMemo, useState } from 'react';
import { DesaSettings, Dusun, RT, RW, TPS, Voter } from '../types';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  MapPin,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Vote,
} from 'lucide-react';
import { EligibilityBadge, StatusBadge } from './StatusBadge';
import { formatDateToLong, maskNik } from '../utils/dateUtils';

interface DashboardProps {
  voters: Voter[];
  dusuns?: Dusun[];
  rws: RW[];
  rts: RT[];
  tpsList?: TPS[];
  settings: DesaSettings;
  onNavigate: (page: string) => void;
  onAddVoter: () => void;
  onSelectVoter: (voter: Voter) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  voters,
  dusuns = [],
  rws,
  rts,
  tpsList = [],
  settings,
  onNavigate,
  onAddVoter,
  onSelectVoter,
}) => {
  // Dynamic multi-level filters
  const [filterDusun, setFilterDusun] = useState<string>('all');
  const [filterRw, setFilterRw] = useState<string>('all');
  const [filterRt, setFilterRt] = useState<string>('all');
  const [filterTps, setFilterTps] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');

  // Filtered RT options based on selected RW
  const filteredRtOptions = useMemo(() => {
    if (filterRw === 'all') return rts;
    return rts.filter((r) => r.rwNomor === filterRw);
  }, [rts, filterRw]);

  // Filtered voters based on active filters
  const filteredVoters = useMemo(() => {
    return voters.filter((v) => {
      if (filterDusun !== 'all' && v.dusunId !== filterDusun) return false;
      if (filterRw !== 'all' && v.rw !== filterRw) return false;
      if (filterRt !== 'all' && v.rt !== filterRt) return false;
      if (filterTps !== 'all') {
        if (filterTps === 'unassigned') {
          if (v.tpsId) return false;
        } else if (v.tpsId !== filterTps) {
          return false;
        }
      }
      if (filterGender !== 'all' && v.jenisKelamin !== filterGender) return false;
      return true;
    });
  }, [voters, filterDusun, filterRw, filterRt, filterTps, filterGender]);

  // Dynamic statistics calculated on filtered data
  const stats = useMemo(() => {
    const total = filteredVoters.length;
    const sudah = filteredVoters.filter((v) => v.statusVerifikasi === 'sudah_diverifikasi').length;
    const belum = filteredVoters.filter((v) => v.statusVerifikasi === 'belum_diverifikasi').length;
    const perbaikan = filteredVoters.filter((v) => v.statusVerifikasi === 'perlu_perbaikan').length;

    // Gender breakdown
    const pria = filteredVoters.filter((v) => v.jenisKelamin === 'L').length;
    const wanita = filteredVoters.filter((v) => v.jenisKelamin === 'P').length;

    // Eligibility breakdown
    const memenuhiSyarat = filteredVoters.filter(
      (v) => v.kelayakanStatus === 'memenuhi_syarat_usia' || v.kelayakanStatus === 'terverifikasi'
    ).length;
    const perluPemeriksaan = filteredVoters.filter((v) => v.kelayakanStatus === 'perlu_pemeriksaan').length;
    const belumDinilai = filteredVoters.filter((v) => v.kelayakanStatus === 'belum_dapat_dinilai').length;

    // TPS assignments
    const assignedTps = filteredVoters.filter((v) => !!v.tpsId).length;
    const unassignedTps = filteredVoters.filter((v) => !v.tpsId).length;

    // Issues count: perlu_perbaikan + perlu_pemeriksaan
    const issueCount = perbaikan + perluPemeriksaan;

    return {
      total,
      sudah,
      belum,
      perbaikan,
      pria,
      wanita,
      memenuhiSyarat,
      perluPemeriksaan,
      belumDinilai,
      assignedTps,
      unassignedTps,
      issueCount,
    };
  }, [filteredVoters]);

  // Reset filters
  const resetFilters = () => {
    setFilterDusun('all');
    setFilterRw('all');
    setFilterRt('all');
    setFilterTps('all');
    setFilterGender('all');
  };

  const isFilterActive =
    filterDusun !== 'all' ||
    filterRw !== 'all' ||
    filterRt !== 'all' ||
    filterTps !== 'all' ||
    filterGender !== 'all';

  // Recent voters
  const recentVoters = useMemo(() => {
    return [...filteredVoters]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [filteredVoters]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-emerald-200 text-xs font-semibold">
            <Vote className="w-3.5 h-3.5" />
            <span>Pilkades Periode {settings.periodePilkades} &bull; {settings.namaDesa}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Pusat Monitoring DPT & Pemetaan TPS {settings.namaDesa}
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Kecamatan {settings.kecamatan}, Kabupaten {settings.kabupaten}. Pengelolaan data pemilih, penapisan kelayakan usia pada hari pemungutan suara, dan sebaran Tempat Pemungutan Suara (TPS).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onAddVoter}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4 text-emerald-800" />
            <span>Tambah Pemilih</span>
          </button>
          <button
            onClick={() => onNavigate('tps')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold border border-emerald-500/40 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>Kelola TPS & Peta</span>
          </button>
        </div>
      </div>

      {/* Tanggal Pelaksanaan Pilkades Banner */}
      {settings.tanggalPelaksanaan ? (
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Hari H Pemungutan Suara Pilkades:
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded-lg text-xs font-mono">
                  {settings.tanggalPelaksanaan.split('-').reverse().join('-')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formatDateToLong(settings.tanggalPelaksanaan)} &bull; Seluruh usia calon pemilih dihitung otomatis secara presisi berdasarkan tanggal ini.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold self-start sm:self-auto shrink-0"
          >
            Ubah Tanggal & Pengaturan &rarr;
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-900 text-xs">
                Tanggal Pelaksanaan Pilkades Belum Ditentukan
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Sistem memerlukan tanggal pemungutan suara untuk menghitung otomatis kelayakan usia pemilih.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
          >
            Atur Tanggal Pilkades
          </button>
        </div>
      )}

      {/* Dynamic Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Filter className="w-4 h-4 text-emerald-800" />
            <span>Filter Statistik Interaktif</span>
            {isFilterActive && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                Aktif ({filteredVoters.length} Pemilih Terpilih)
              </span>
            )}
          </div>
          {isFilterActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Filter Dusun */}
          <select
            value={filterDusun}
            onChange={(e) => setFilterDusun(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">Semua Dusun ({dusuns.length})</option>
            {dusuns.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama}
              </option>
            ))}
          </select>

          {/* Filter RW */}
          <select
            value={filterRw}
            onChange={(e) => {
              setFilterRw(e.target.value);
              setFilterRt('all');
            }}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">Semua RW ({rws.length})</option>
            {rws.map((r) => (
              <option key={r.id} value={r.nomor}>
                RW {r.nomor}
              </option>
            ))}
          </select>

          {/* Filter RT */}
          <select
            value={filterRt}
            onChange={(e) => setFilterRt(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">Semua RT ({filteredRtOptions.length})</option>
            {filteredRtOptions.map((r) => (
              <option key={r.id} value={r.nomor}>
                RT {r.nomor}
              </option>
            ))}
          </select>

          {/* Filter TPS */}
          <select
            value={filterTps}
            onChange={(e) => setFilterTps(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">Semua TPS ({tpsList.length})</option>
            <option value="unassigned">⚠️ Belum Punya TPS</option>
            {tpsList.map((t) => (
              <option key={t.id} value={t.id}>
                TPS {t.nomor} ({t.namaTempat || t.nama})
              </option>
            ))}
          </select>

          {/* Filter Gender */}
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">Semua Jenis Kelamin</option>
            <option value="L">Laki-Laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Pemilih */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Pemilih Terdaftar</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-slate-500">
            L: {stats.pria} &bull; P: {stats.wanita}
          </span>
        </div>

        {/* Dusun, RW, RT */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Cakupan Wilayah</span>
          <div className="text-base font-extrabold text-slate-900 mt-1">
            {dusuns.length} <span className="text-xs font-normal text-slate-500">Dusun</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {rws.length} RW &bull; {rts.length} RT
          </span>
        </div>

        {/* Total TPS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Jumlah TPS</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">{tpsList.length}</p>
          <span className="text-[11px] text-emerald-700">Titik Pemungutan</span>
        </div>

        {/* Terverifikasi */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase">Terverifikasi</span>
          <p className="text-2xl font-black text-emerald-950 mt-1">{stats.sudah}</p>
          <span className="text-[11px] text-emerald-700">
            {stats.total > 0 ? Math.round((stats.sudah / stats.total) * 100) : 0}% sah
          </span>
        </div>

        {/* Belum Ada TPS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Belum Punya TPS</span>
          <p
            className={`text-2xl font-black mt-1 ${
              stats.unassignedTps > 0 ? 'text-amber-600' : 'text-emerald-700'
            }`}
          >
            {stats.unassignedTps}
          </p>
          <span className="text-[11px] text-slate-500">Perlu alokasi TPS</span>
        </div>

        {/* Data Bermasalah / Perlu Review */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 bg-rose-50/30 shadow-xs">
          <span className="text-[10px] font-bold text-rose-800 uppercase">Perlu Perbaikan</span>
          <p
            className={`text-2xl font-black mt-1 ${
              stats.issueCount > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {stats.issueCount}
          </p>
          <span className="text-[11px] text-rose-700">Data belum tervalidasi</span>
        </div>
      </div>

      {/* TPS Sebaran Overview Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-800" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Sebaran Pemilih per TPS Desa {settings.namaDesa}
              </h3>
              <p className="text-xs text-slate-500">
                Kapasitas dan jumlah pemilih yang telah dialokasikan pada setiap TPS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('tps_recap')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>Lihat Rekapitulasi Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tpsList.map((tps) => {
            const assigned = voters.filter((v) => v.tpsId === tps.id);
            const capacity = tps.kapasitas || 300;
            const pct = Math.min(100, Math.round((assigned.length / capacity) * 100));

            return (
              <div
                key={tps.id}
                onClick={() => onNavigate('tps')}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900">TPS {tps.nomor}</span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {tps.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate font-medium">
                    {tps.namaTempat || tps.nama}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    RW {tps.rw || '-'} / RT {tps.rt || '-'}
                  </p>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">{assigned.length} Pemilih</span>
                    <span className="text-slate-400 font-mono text-[10px]">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Recent Voters & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Voters (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Data Pemilih Terakhir Ditambahkan ({filteredVoters.length} Pemilih)
            </h3>
            <button
              onClick={() => onNavigate('voters')}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
            >
              <span>Lihat Semua DPT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {recentVoters.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Tidak ada data pemilih sesuai filter.
              </div>
            ) : (
              recentVoters.map((v) => (
                <div
                  key={v.id}
                  onClick={() => onSelectVoter(v)}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {v.namaLengkap.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-800">
                        {v.namaLengkap}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {maskNik(v.nik)} &bull; RT {v.rt}/RW {v.rw} {v.dusunNama ? `(${v.dusunNama})` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {v.tpsNomor ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        TPS {v.tpsNomor}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Tanpa TPS
                      </span>
                    )}
                    <StatusBadge status={v.statusVerifikasi} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Menu Shortcuts (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Akses Cepat Pengelolaan</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigate('tps')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-800" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                      Kelola TPS & Peta
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Titik lokasi koordinat & fasilitas
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-800" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('tps_recap')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-800" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                      Rekapitulasi Gender
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tabel L/P per TPS & cetak Model A
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-800" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('territories')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-800" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                      Data Wilayah Dusun & RT/RW
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Hierarki kependudukan desa
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-800" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('public_preview')}
                className="w-full p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Vote className="w-4 h-4 text-emerald-800" />
                  <div>
                    <div className="text-xs font-bold text-emerald-950">
                      Pratinjau Portal Publik
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Lihat tampilan seperti yang dilihat warga
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-800" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
