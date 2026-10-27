import React, { useMemo, useState } from 'react';
import { DesaSettings, Dusun, TPS, Voter } from '../types';
import { formatDateToLong, maskNik, maskName } from '../utils/dateUtils';
import { TpsMap } from './TpsMap';
import {
  Building,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  LogIn,
  MapPin,
  Search,
  ShieldCheck,
  Users,
  Vote,
  AlertCircle,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface PublicPortalProps {
  settings: DesaSettings;
  tpsList: TPS[];
  voters: Voter[];
  dusuns: Dusun[];
  onOpenLogin: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  settings,
  tpsList,
  voters,
  dusuns,
  onOpenLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'peta' | 'cek_nik' | 'rekap'>('peta');
  const [selectedTpsId, setSelectedTpsId] = useState<string | undefined>(tpsList[0]?.id);

  // Cek NIK state
  const [nikInput, setNikInput] = useState('');
  const [searchResult, setSearchResult] = useState<{
    searched: boolean;
    found: boolean;
    voter?: Voter;
    tps?: TPS;
    message?: string;
  }>({ searched: false, found: false });

  // Agregate Stats
  const stats = useMemo(() => {
    const totalDpt = voters.length;
    const male = voters.filter((v) => v.jenisKelamin === 'L').length;
    const female = voters.filter((v) => v.jenisKelamin === 'P').length;
    const totalTps = tpsList.length;

    return { totalDpt, male, female, totalTps };
  }, [voters, tpsList]);

  // Handle NIK verification
  const handleCheckNik = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNik = nikInput.trim();
    if (!cleanNik) return;

    if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
      setSearchResult({
        searched: true,
        found: false,
        message: 'Nomor Induk Kependudukan (NIK) harus terdiri dari 16 digit angka.',
      });
      return;
    }

    const matched = voters.find((v) => v.nik && v.nik.trim() === cleanNik);
    if (!matched) {
      setSearchResult({
        searched: true,
        found: false,
        message: `NIK ${cleanNik} belum terdaftar dalam DPT Desa ${settings.namaDesa}. Silakan hubungi Panitia Pilkades atau ketua RT/RW setempat dengan membawa KTP-el dan Kartu Keluarga.`,
      });
      return;
    }

    const matchedTps = tpsList.find((t) => t.id === matched.tpsId);
    setSearchResult({
      searched: true,
      found: true,
      voter: matched,
      tps: matchedTps,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-emerald-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-xs">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight leading-tight">
                  Portal Informasi DPT Pilkades
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-emerald-100 border border-emerald-600">
                  Publik
                </span>
              </div>
              <p className="text-[11px] text-emerald-200">
                {settings.namaDesa}, {settings.kecamatan}, {settings.kabupaten}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton />
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Panitia</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-emerald-900 to-emerald-800 text-white pb-10 pt-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-100 text-xs font-semibold mb-3 border border-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sistem Informasi Resmi Pemilihan Kepala Desa {settings.periodePilkades}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Peta Lokasi TPS & Cek DPT Mandiri Warga
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Pelajari lokasi Tempat Pemungutan Suara (TPS), peta titik koordinat rute, dan pastikan hak pilih Anda telah terdaftar dalam Daftar Pemilih Tetap (DPT).
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Total DPT</span>
              <p className="text-xl sm:text-2xl font-black mt-0.5">{stats.totalDpt}</p>
              <span className="text-[10px] text-emerald-300">Warga Terdaftar</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Total TPS</span>
              <p className="text-xl sm:text-2xl font-black mt-0.5">{stats.totalTps}</p>
              <span className="text-[10px] text-emerald-300">Titik Pemungutan</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Laki-Laki / Perempuan</span>
              <p className="text-xl sm:text-2xl font-black mt-0.5">{stats.male} / {stats.female}</p>
              <span className="text-[10px] text-emerald-300">Pemilih L & P</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Hari Pemungutan</span>
              <p className="text-sm sm:text-base font-bold mt-1 truncate">
                {formatDateToLong(settings.tanggalPelaksanaan)}
              </p>
              <span className="text-[10px] text-emerald-300">Jadwal Pilkades</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 pb-12 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('peta')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'peta'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Peta & Lokasi TPS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cek_nik')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cek_nik'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Cek DPT Mandiri (NIK)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rekap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rekap'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Rekapitulasi Suara</span>
          </button>
        </div>

        {/* TAB 1: PETA & LOKASI TPS */}
        {activeTab === 'peta' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Peta Sebaran Tempat Pemungutan Suara
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik pin TPS untuk melihat lokasi rute dan wilayah pemilih yang dilayani.
                  </p>
                </div>
              </div>

              <TpsMap
                tpsList={tpsList}
                selectedTpsId={selectedTpsId}
                onSelectTps={(t) => setSelectedTpsId(t.id)}
                height="420px"
              />
            </div>

            {/* List of TPS Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tpsList.map((tps) => {
                const assigned = voters.filter((v) => v.tpsId === tps.id);
                const googleMapsUrl = `https://www.google.com/maps?q=${tps.latitude},${tps.longitude}`;
                const isSelected = tps.id === selectedTpsId;

                return (
                  <div
                    key={tps.id}
                    onClick={() => setSelectedTpsId(tps.id)}
                    className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs ${
                      isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white text-xs font-black flex items-center justify-center">
                          {tps.nomor}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{tps.nama}</h4>
                          <span className="text-[11px] text-slate-500">{tps.namaTempat || tps.alamat}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {tps.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600 mb-4 border border-slate-100">
                      <div>
                        <strong>Wilayah:</strong> {tps.dusunNama || 'Semua Dusun'} (RW {tps.rw || '-'} / RT {tps.rt || '-'})
                      </div>
                      <div>
                        <strong>Alamat:</strong> {tps.alamat || '-'}
                      </div>
                      <div className="text-emerald-800 font-medium">
                        ♿ {tps.aksesibilitas || 'Ramah pemilih'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                      <span className="font-semibold text-slate-600">
                        {assigned.length} Pemilih Terdaftar
                      </span>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-900"
                      >
                        <span>Buka Rute Peta</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CEK DPT MANDIRI */}
        {activeTab === 'cek_nik' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-center max-w-md mx-auto mb-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">
                  Cek Status DPT Mandiri
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan 16 digit Nomor Induk Kependudukan (NIK) pada e-KTP Anda untuk mengetahui status pendaftaran dan nomor TPS.
                </p>
              </div>

              <form onSubmit={handleCheckNik} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Induk Kependudukan (16 Digit NIK)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={nikInput}
                    onChange={(e) => setNikInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 321101xxxxxxxxxx"
                    className="w-full px-4 py-3 text-base font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 text-center"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Periksa Data Pemilih</span>
                </button>
              </form>

              {/* Result display */}
              {searchResult.searched && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  {searchResult.found && searchResult.voter ? (
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 animate-scale-up">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 text-white rounded-xl">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                            Terdaftar Dalam DPT Resmi
                          </span>
                          <h4 className="text-base font-extrabold text-emerald-950">
                            {maskName(searchResult.voter.namaLengkap)}
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs bg-white/80 p-3.5 rounded-xl border border-emerald-100">
                        <div>
                          <span className="text-slate-500">NIK (Disamarkan):</span>
                          <p className="font-mono font-bold text-slate-800 mt-0.5">
                            {maskNik(searchResult.voter.nik)}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Wilayah Domisili:</span>
                          <p className="font-bold text-slate-800 mt-0.5">
                            RT {searchResult.voter.rt} / RW {searchResult.voter.rw} ({searchResult.voter.dusunNama || '-'})
                          </p>
                        </div>
                      </div>

                      {searchResult.tps ? (
                        <div className="p-4 bg-emerald-800 text-white rounded-xl space-y-2">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                            Lokasi Tempat Pemungutan Suara Anda:
                          </div>
                          <div className="text-lg font-black">
                            TPS {searchResult.tps.nomor}: {searchResult.tps.nama}
                          </div>
                          <p className="text-xs text-emerald-100">
                            📍 {searchResult.tps.namaTempat || searchResult.tps.alamat}
                          </p>
                          <div className="pt-2">
                            <a
                              href={`https://www.google.com/maps?q=${searchResult.tps.latitude},${searchResult.tps.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-50 transition"
                            >
                              <span>Buka Petunjuk Arah di Google Maps</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-100 text-amber-900 rounded-xl text-xs">
                          Pemilih sudah terdaftar dalam DPT, namun penempatan nomor TPS masih dalam proses perapihan oleh panitia.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm mb-1">Data Belum Ditemukan</div>
                        <p>{searchResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Privacy notice */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong>Perlindungan Data Pribadi (UU No. 27/2022):</strong> NIK dan nama lengkap pada portal publik disamarkan secara otomatis demi menjaga kerahasiaan identitas kependudukan warga desa.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REKAPITULASI SUARA */}
        {activeTab === 'rekap' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Rekapitulasi Pemilih per TPS Desa {settings.namaDesa}
                </h3>
                <p className="text-xs text-slate-500">
                  Distribusi pemilih laki-laki dan perempuan di seluruh TPS
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-center">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">NO</th>
                    <th className="py-2.5 px-4 border-r border-slate-200 text-left">TPS</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-left">LOKASI</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-blue-900 w-20">LAKI-LAKI</th>
                    <th className="py-2.5 px-3 border-r border-slate-200 text-purple-900 w-20">PEREMPUAN</th>
                    <th className="py-2.5 px-3 font-black text-slate-900 w-24">TOTAL PEMILIH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tpsList.map((tps, idx) => {
                    const assigned = voters.filter((v) => v.tpsId === tps.id);
                    const l = assigned.filter((v) => v.jenisKelamin === 'L').length;
                    const p = assigned.filter((v) => v.jenisKelamin === 'P').length;

                    return (
                      <tr key={tps.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono border-r border-slate-100">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800 border-r border-slate-100">
                          TPS {tps.nomor} - {tps.nama}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 border-r border-slate-100">
                          {tps.namaTempat || tps.alamat || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-blue-800 border-r border-slate-100">
                          {l}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-purple-800 border-r border-slate-100">
                          {p}
                        </td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-slate-900 bg-slate-50/70">
                          {assigned.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-center text-xs text-slate-500 mt-auto">
        <p className="font-semibold text-slate-700">
          Panitia Pemilihan Kepala Desa {settings.namaDesa} &bull; Periode {settings.periodePilkades}
        </p>
        <p className="mt-1 text-[11px]">
          {settings.alamatKantor} &bull; Kontak: {settings.kontakSekretariat}
        </p>
      </footer>
    </div>
  );
};
