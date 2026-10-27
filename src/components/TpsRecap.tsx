import React, { useMemo, useState } from 'react';
import { DesaSettings, Dusun, RT, RW, TPS, Voter } from '../types';
import { formatDateToLong, maskNik, maskKk } from '../utils/dateUtils';
import {
  Building,
  CheckCircle2,
  FileSpreadsheet,
  Filter,
  MapPin,
  Printer,
  Search,
  Users,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface TpsRecapProps {
  tpsList: TPS[];
  voters: Voter[];
  dusuns: Dusun[];
  rws: RW[];
  rts: RT[];
  settings: DesaSettings;
  onSelectTps?: (tps: TPS) => void;
}

export const TpsRecap: React.FC<TpsRecapProps> = ({
  tpsList,
  voters,
  dusuns,
  rws,
  rts,
  settings,
  onSelectTps,
}) => {
  // Filters
  const [dusunFilter, setDusunFilter] = useState('all');
  const [rwFilter, setRwFilter] = useState('all');
  const [selectedTpsModal, setSelectedTpsModal] = useState<TPS | null>(null);
  const [voterSearch, setVoterSearch] = useState('');

  // Total voters across village
  const totalVillageVoters = voters.length;

  // Compute recapitulation rows per TPS
  const recapData = useMemo(() => {
    return tpsList
      .filter((tps) => {
        if (dusunFilter !== 'all' && tps.dusunId !== dusunFilter) return false;
        if (rwFilter !== 'all' && tps.rw !== rwFilter) return false;
        return true;
      })
      .map((tps) => {
        const assigned = voters.filter((v) => v.tpsId === tps.id);
        const lCount = assigned.filter((v) => v.jenisKelamin === 'L').length;
        const pCount = assigned.filter((v) => v.jenisKelamin === 'P').length;
        const verifiedCount = assigned.filter(
          (v) => v.statusVerifikasi === 'sudah_diverifikasi'
        ).length;
        const unverifiedCount = assigned.length - verifiedCount;
        const capacity = tps.kapasitas || 300;
        const percentOfVillage =
          totalVillageVoters > 0
            ? parseFloat(((assigned.length / totalVillageVoters) * 100).toFixed(1))
            : 0;

        return {
          tps,
          lCount,
          pCount,
          total: assigned.length,
          verifiedCount,
          unverifiedCount,
          capacity,
          percentOfVillage,
        };
      });
  }, [tpsList, voters, dusunFilter, rwFilter, totalVillageVoters]);

  // Grand totals
  const grandTotals = useMemo(() => {
    return recapData.reduce(
      (acc, row) => ({
        lCount: acc.lCount + row.lCount,
        pCount: acc.pCount + row.pCount,
        total: acc.total + row.total,
        verifiedCount: acc.verifiedCount + row.verifiedCount,
        unverifiedCount: acc.unverifiedCount + row.unverifiedCount,
        capacity: acc.capacity + row.capacity,
      }),
      {
        lCount: 0,
        pCount: 0,
        total: 0,
        verifiedCount: 0,
        unverifiedCount: 0,
        capacity: 0,
      }
    );
  }, [recapData]);

  // Unassigned voters
  const unassignedVoters = useMemo(() => {
    return voters.filter((v) => !v.tpsId);
  }, [voters]);

  // Export Excel
  const handleExportExcel = () => {
    const dataRows = recapData.map((row, idx) => ({
      No: idx + 1,
      'Nomor TPS': `TPS ${row.tps.nomor}`,
      'Nama TPS / Lokasi': row.tps.nama,
      'Tempat Pemungutan': row.tps.namaTempat || '-',
      Dusun: row.tps.dusunNama || '-',
      'Cakupan RW': row.tps.rw || '-',
      'Cakupan RT': row.tps.rt || '-',
      'Pemilih Laki-Laki (L)': row.lCount,
      'Pemilih Perempuan (P)': row.pCount,
      'Total Pemilih': row.total,
      'Terverifikasi': row.verifiedCount,
      'Belum / Perlu Perbaikan': row.unverifiedCount,
      'Kapasitas Maks': row.capacity,
      'Persentase DPT Desa (%)': `${row.percentOfVillage}%`,
    }));

    // Add Grand Total row
    dataRows.push({
      No: '' as any,
      'Nomor TPS': 'JUMLAH TOTAL',
      'Nama TPS / Lokasi': `${recapData.length} TPS Terdaftar`,
      'Tempat Pemungutan': '',
      Dusun: '',
      'Cakupan RW': '',
      'Cakupan RT': '',
      'Pemilih Laki-Laki (L)': grandTotals.lCount,
      'Pemilih Perempuan (P)': grandTotals.pCount,
      'Total Pemilih': grandTotals.total,
      'Terverifikasi': grandTotals.verifiedCount,
      'Belum / Perlu Perbaikan': grandTotals.unverifiedCount,
      'Kapasitas Maks': grandTotals.capacity,
      'Persentase DPT Desa (%)': '100%',
    });

    const ws = XLSX.utils.json_to_sheet(dataRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi_TPS_Gender');
    XLSX.writeFile(
      wb,
      `Rekapitulasi_DPT_TPS_Pilkades_${settings.namaDesa.replace(/\s+/g, '_')}.xlsx`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Voters for drill-down modal
  const modalVoters = useMemo(() => {
    if (!selectedTpsModal) return [];
    return voters
      .filter((v) => v.tpsId === selectedTpsModal.id)
      .filter((v) => {
        if (!voterSearch.trim()) return true;
        const q = voterSearch.toLowerCase();
        return (
          v.namaLengkap.toLowerCase().includes(q) ||
          (v.nik && v.nik.includes(q)) ||
          v.rt.includes(q) ||
          v.rw.includes(q)
        );
      });
  }, [selectedTpsModal, voters, voterSearch]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-800 text-white rounded-xl shadow-xs">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Rekapitulasi Pemilih per TPS & Jenis Kelamin
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Daftar Pemilih Tetap (DPT) Model Rekapitulasi Berdasarkan Jenis Kelamin & Sebaran TPS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <span>Ekspor Excel (XLSX)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekapitulasi</span>
          </button>
        </div>
      </div>

      {/* Official Letterhead (Visible when printing) */}
      <div className="hidden print:block p-4 border-b-2 border-slate-900 text-center mb-6">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
          PANITIA PEMILIHAN KEPALA DESA {settings.namaDesa.toUpperCase()}
        </h2>
        <p className="text-xs text-slate-700">
          KECAMATAN {settings.kecamatan.toUpperCase()} KABUPATEN {settings.kabupaten.toUpperCase()}
        </p>
        <p className="text-[11px] text-slate-500">{settings.alamatKantor}</p>
        <div className="mt-3 font-bold text-sm text-slate-900 underline">
          REKAPITULASI DAFTAR PEMILIH TETAP (DPT) PER TEMPAT PEMUNGUTAN SUARA
        </div>
        <p className="text-[11px] text-slate-600">
          Tahun Pemilihan: {settings.periodePilkades} | Tanggal Pemungutan: {formatDateToLong(settings.tanggalPelaksanaan)}
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total DPT Desa
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalVillageVoters}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Pemilih Terdaftar</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            Laki-Laki (L)
          </span>
          <div className="text-2xl font-black text-blue-900 mt-1">{grandTotals.lCount}</div>
          <span className="text-[11px] text-blue-700 mt-1 block">
            {totalVillageVoters > 0 ? Math.round((grandTotals.lCount / totalVillageVoters) * 100) : 0}% dari total DPT
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white shadow-xs">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
            Perempuan (P)
          </span>
          <div className="text-2xl font-black text-purple-900 mt-1">{grandTotals.pCount}</div>
          <span className="text-[11px] text-purple-700 mt-1 block">
            {totalVillageVoters > 0 ? Math.round((grandTotals.pCount / totalVillageVoters) * 100) : 0}% dari total DPT
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Belum Dialokasikan TPS
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              unassignedVoters.length > 0 ? 'text-amber-600' : 'text-emerald-700'
            }`}
          >
            {unassignedVoters.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {unassignedVoters.length > 0 ? 'Perlu penetapan segera' : '100% Pemilih Terpetakan'}
          </span>
        </div>
      </div>

      {/* Filter Bar (No print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
          <Filter className="w-4 h-4 text-emerald-800" />
          <span>Filter Wilayah:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dusunFilter}
            onChange={(e) => setDusunFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
          >
            <option value="all">Semua Dusun</option>
            {dusuns.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama}
              </option>
            ))}
          </select>

          <select
            value={rwFilter}
            onChange={(e) => setRwFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
          >
            <option value="all">Semua RW</option>
            {rws.map((r) => (
              <option key={r.id} value={r.nomor}>
                RW {r.nomor} ({r.nama})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Recapitulation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-center">
              <tr>
                <th rowSpan={2} className="py-3 px-3 border-r border-slate-200 w-12 text-center">
                  NO
                </th>
                <th rowSpan={2} className="py-3 px-4 border-r border-slate-200 text-left">
                  NOMOR & NAMA TPS
                </th>
                <th rowSpan={2} className="py-3 px-3 border-r border-slate-200 text-left">
                  LOKASI / TEMPAT
                </th>
                <th rowSpan={2} className="py-3 px-3 border-r border-slate-200 text-left">
                  WILAYAH LAYANAN
                </th>
                <th colSpan={3} className="py-2 px-3 border-r border-slate-200 bg-slate-200/70">
                  JENIS KELAMIN
                </th>
                <th colSpan={2} className="py-2 px-3 border-r border-slate-200 bg-emerald-100/50">
                  VERIFIKASI
                </th>
                <th rowSpan={2} className="py-3 px-3 border-r border-slate-200 w-24">
                  % DPT DESA
                </th>
                <th rowSpan={2} className="py-3 px-3 w-28 no-print">
                  AKSI
                </th>
              </tr>
              <tr className="text-[11px] bg-slate-100 border-t border-slate-200">
                <th className="py-1.5 px-3 border-r border-slate-200 text-blue-900 w-16">L</th>
                <th className="py-1.5 px-3 border-r border-slate-200 text-purple-900 w-16">P</th>
                <th className="py-1.5 px-3 border-r border-slate-200 font-black w-20">L + P</th>
                <th className="py-1.5 px-3 border-r border-slate-200 text-emerald-800 w-20">SAH</th>
                <th className="py-1.5 px-3 border-r border-slate-200 text-amber-800 w-20">REVIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recapData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Tidak ada TPS yang sesuai filter.
                  </td>
                </tr>
              ) : (
                recapData.map((row, idx) => (
                  <tr key={row.tps.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 border-r border-slate-100">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-emerald-800 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {row.tps.nomor}
                        </span>
                        <span>{row.tps.nama}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 border-r border-slate-100">
                      {row.tps.namaTempat || row.tps.alamat || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-100">
                      {row.tps.dusunNama || '-'} (RW {row.tps.rw || '-'} / RT {row.tps.rt || '-'})
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-800 border-r border-slate-100">
                      {row.lCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-purple-800 border-r border-slate-100">
                      {row.pCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-extrabold text-slate-900 bg-slate-50/70 border-r border-slate-100">
                      {row.total}
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-800 font-semibold border-r border-slate-100">
                      {row.verifiedCount}
                    </td>
                    <td className="py-2.5 px-3 text-center text-amber-800 font-semibold border-r border-slate-100">
                      {row.unverifiedCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-100">
                      {row.percentOfVillage}%
                    </td>
                    <td className="py-2.5 px-3 text-center no-print">
                      <button
                        type="button"
                        onClick={() => setSelectedTpsModal(row.tps)}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                      >
                        Lihat DPT
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Grand Total Row */}
            <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider border-r border-slate-200">
                  TOTAL REKAPITULASI DESA:
                </td>
                <td className="py-3 px-3 text-center text-blue-900 border-r border-slate-200">
                  {grandTotals.lCount}
                </td>
                <td className="py-3 px-3 text-center text-purple-900 border-r border-slate-200">
                  {grandTotals.pCount}
                </td>
                <td className="py-3 px-3 text-center text-emerald-950 bg-emerald-100/70 border-r border-slate-200 text-sm">
                  {grandTotals.total}
                </td>
                <td className="py-3 px-3 text-center text-emerald-900 border-r border-slate-200">
                  {grandTotals.verifiedCount}
                </td>
                <td className="py-3 px-3 text-center text-amber-900 border-r border-slate-200">
                  {grandTotals.unverifiedCount}
                </td>
                <td className="py-3 px-3 text-center font-mono border-r border-slate-200">
                  100%
                </td>
                <td className="py-3 px-3 no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Official Signatures (Visible when printing) */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-8 mt-6 text-center text-xs">
        <div>
          <p className="font-semibold text-slate-700">Mengetahui,</p>
          <p className="font-bold text-slate-900 uppercase">Ketua Panitia Pilkades</p>
          <div className="h-20" />
          <p className="font-bold underline text-slate-900">{settings.namaKetuaPanitia}</p>
        </div>

        <div>
          <p className="font-semibold text-slate-700">
            {settings.namaDesa}, {formatDateToLong(new Date().toISOString().split('T')[0])}
          </p>
          <p className="font-bold text-slate-900 uppercase">Sekretaris Panitia Pilkades</p>
          <div className="h-20" />
          <p className="font-bold underline text-slate-900">{settings.namaSekretaris}</p>
        </div>
      </div>

      {/* Drill-down Voter List Modal */}
      {selectedTpsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden my-6 border border-slate-200">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  Daftar Pemilih TPS {selectedTpsModal.nomor} - {selectedTpsModal.nama}
                </h3>
                <p className="text-xs text-emerald-200">
                  Total: {modalVoters.length} pemilih | NIK & KK disamarkan demi privasi warga
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTpsModal(null)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pemilih di TPS ini..."
                  value={voterSearch}
                  onChange={(e) => setVoterSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3 w-10">No</th>
                      <th className="py-2 px-3">Nama Pemilih</th>
                      <th className="py-2 px-3">NIK (Sensor)</th>
                      <th className="py-2 px-3 w-12">JK</th>
                      <th className="py-2 px-3">RT/RW</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalVoters.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          Tidak ada pemilih ditemukan.
                        </td>
                      </tr>
                    ) : (
                      modalVoters.map((v, i) => (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-500 font-mono">{i + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{v.namaLengkap}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{maskNik(v.nik)}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                v.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {v.jenisKelamin || '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">RT {v.rt}/RW {v.rw}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                v.statusVerifikasi === 'sudah_diverifikasi'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {v.statusVerifikasi === 'sudah_diverifikasi' ? 'Sah' : 'Review'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedTpsModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
