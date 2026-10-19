import React, { useMemo } from 'react';
import { DesaSettings, Dusun, RT, RW, Voter } from '../types';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  MapPin,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Vote,
} from 'lucide-react';
import { EligibilityBadge, StatusBadge } from './StatusBadge';
import { formatDateToLong } from '../utils/dateUtils';

interface DashboardProps {
  voters: Voter[];
  dusuns?: Dusun[];
  rws: RW[];
  rts: RT[];
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
  settings,
  onNavigate,
  onAddVoter,
  onSelectVoter,
}) => {
  const stats = useMemo(() => {
    const total = voters.length;
    const sudah = voters.filter((v) => v.statusVerifikasi === 'sudah_diverifikasi').length;
    const belum = voters.filter((v) => v.statusVerifikasi === 'belum_diverifikasi').length;
    const perbaikan = voters.filter((v) => v.statusVerifikasi === 'perlu_perbaikan').length;

    // Eligibility breakdown
    const memenuhiSyarat = voters.filter(
      (v) => v.kelayakanStatus === 'memenuhi_syarat_usia' || v.kelayakanStatus === 'terverifikasi'
    ).length;
    const perluPemeriksaan = voters.filter((v) => v.kelayakanStatus === 'perlu_pemeriksaan').length;
    const belumDinilai = voters.filter((v) => v.kelayakanStatus === 'belum_dapat_dinilai').length;

    // Gender breakdown
    const pria = voters.filter((v) => v.jenisKelamin === 'L').length;
    const wanita = voters.filter((v) => v.jenisKelamin === 'P').length;

    const percentSudah = total > 0 ? Math.round((sudah / total) * 100) : 0;
    const percentBelum = total > 0 ? Math.round((belum / total) * 100) : 0;
    const percentPerbaikan = total > 0 ? Math.round((perbaikan / total) * 100) : 0;

    // By RW
    const byRw: Record<string, { count: number; nama: string }> = {};
    rws.forEach((rw) => {
      byRw[rw.nomor] = { count: 0, nama: rw.nama };
    });
    voters.forEach((v) => {
      if (!byRw[v.rw]) {
        byRw[v.rw] = { count: 0, nama: `RW ${v.rw}` };
      }
      byRw[v.rw].count += 1;
    });

    return {
      total,
      sudah,
      belum,
      perbaikan,
      memenuhiSyarat,
      perluPemeriksaan,
      belumDinilai,
      pria,
      wanita,
      percentSudah,
      percentBelum,
      percentPerbaikan,
      byRw,
    };
  }, [voters, rws]);

  const recentVoters = useMemo(() => {
    return [...voters]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [voters]);

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
            Pusat Monitoring Daftar Pemilih Tetap (DPT) {settings.namaDesa}
          </h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Kecamatan {settings.kecamatan}, Kabupaten {settings.kabupaten}. Sistem pendataan kependudukan, penapisan kelayakan usia pemilih pada hari pemungutan suara, dan rekapitulasi wilayah desa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onAddVoter}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4 text-emerald-800" />
            <span>Tambah Pemilih Baru</span>
          </button>
          <button
            onClick={() => onNavigate('verification')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold border border-emerald-500/40 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>Verifikasi Data</span>
          </button>
        </div>
      </div>

      {/* Tanggal Pelaksanaan Pilkades Notification Banner */}
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
            Ubah Pengaturan &rarr;
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
                Sistem memerlukan tanggal pemungutan suara untuk menghitung otomatis apakah pemilih genap 17 tahun pada hari H.
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

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total DPT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Pemilih Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
              <span>L: {stats.pria}</span>
              <span>&bull;</span>
              <span>P: {stats.wanita}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Tersebar di {rws.length} RW & {rts.length} RT</span>
          </div>
        </div>

        {/* Sudah Diverifikasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sudah Diverifikasi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-emerald-700">{stats.sudah}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.percentSudah}% dari total pemilih
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.percentSudah}%` }}
            />
          </div>
        </div>

        {/* Memenuhi Syarat Usia Hari H */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Memenuhi Syarat Usia / Kawin</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-teal-700">{stats.memenuhiSyarat}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Usia &ge; 17 thn atau berstatus kawin
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.memenuhiSyarat / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Perlu Pemeriksaan Kelayakan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Perlu Pemeriksaan Kelayakan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-amber-600">{stats.perluPemeriksaan}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {stats.perluPemeriksaan > 0 ? 'Usia < 17 tahun & belum kawin' : 'Tidak ada catatan meragukan'}
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.perluPemeriksaan / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle Grid: Sebaran per RW & Recent Voters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sebaran Wilayah RW */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-800" />
                <span>Sebaran Pemilih per RW</span>
              </h3>
              <p className="text-[11px] text-slate-500">Distribusi pemilih tiap rukun warga</p>
            </div>
            <button
              onClick={() => onNavigate('territories')}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold"
            >
              Kelola Wilayah
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.byRw).map(([rwNomor, info]) => {
              const pct = stats.total > 0 ? Math.round((info.count / stats.total) * 100) : 0;
              return (
                <div key={rwNomor} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      RW {rwNomor} <span className="font-normal text-slate-400">({info.nama})</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {info.count} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-700 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pemilih Terakhir Ditambahkan */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                <span>Entri Pemilih Terkini</span>
              </h3>
              <p className="text-[11px] text-slate-500">Data calon pemilih yang baru diinput ke sistem</p>
            </div>
            <button
              onClick={() => onNavigate('voters')}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
            >
              <span>Lihat Semua DPT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentVoters.map((v) => (
              <div
                key={v.id}
                onClick={() => onSelectVoter(v)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{v.namaLengkap}</span>
                    {v.nik && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        NIK: {v.nik}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>
                      {v.dusunNama ? `${v.dusunNama}, ` : ''}RT {v.rt}/RW {v.rw}
                    </span>
                    {v.usiaPadaPilkades !== undefined && (
                      <>
                        <span>&bull;</span>
                        <span className="font-medium text-emerald-800">
                          {v.usiaPadaPilkades} Thn pd hari H
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <EligibilityBadge status={v.kelayakanStatus} size="sm" />
                  <StatusBadge status={v.statusVerifikasi} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
