import React, { useMemo, useState } from 'react';
import { DesaSettings, RT, RW, Voter } from '../types';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

interface ReportsProps {
  voters: Voter[];
  rws: RW[];
  rts: RT[];
  settings: DesaSettings;
}

export const Reports: React.FC<ReportsProps> = ({ voters, rws, rts, settings }) => {
  const [selectedRw, setSelectedRw] = useState('');
  const [selectedRt, setSelectedRt] = useState('');
  const [reportType, setReportType] = useState<'rekap' | 'daftar_lengkap'>('rekap');

  const availableRts = useMemo(() => {
    return selectedRw ? rts.filter((r) => r.rwNomor === selectedRw) : rts;
  }, [selectedRw, rts]);

  const filteredVoters = useMemo(() => {
    return voters.filter((v) => {
      if (selectedRw && v.rw !== selectedRw) return false;
      if (selectedRt && v.rt !== selectedRt) return false;
      return true;
    });
  }, [voters, selectedRw, selectedRt]);

  // Breakdown statistics per RW & RT
  const rekapData = useMemo(() => {
    return rws.map((rw) => {
      const rwVoters = voters.filter((v) => v.rw === rw.nomor);
      const childRTs = rts.filter((rt) => rt.rwNomor === rw.nomor);

      const rtsBreakdown = childRTs.map((rt) => {
        const rtVoters = rwVoters.filter((v) => v.rt === rt.nomor);
        const sudah = rtVoters.filter((v) => v.statusVerifikasi === 'sudah_diverifikasi').length;
        const belum = rtVoters.filter((v) => v.statusVerifikasi === 'belum_diverifikasi').length;
        const perbaikan = rtVoters.filter((v) => v.statusVerifikasi === 'perlu_perbaikan').length;

        return {
          rtNomor: rt.nomor,
          nama: rt.nama,
          total: rtVoters.length,
          sudah,
          belum,
          perbaikan,
        };
      });

      const totalRw = rwVoters.length;
      const sudahRw = rwVoters.filter((v) => v.statusVerifikasi === 'sudah_diverifikasi').length;
      const belumRw = rwVoters.filter((v) => v.statusVerifikasi === 'belum_diverifikasi').length;
      const perbaikanRw = rwVoters.filter((v) => v.statusVerifikasi === 'perlu_perbaikan').length;

      return {
        rwNomor: rw.nomor,
        rwNama: rw.nama,
        total: totalRw,
        sudah: sudahRw,
        belum: belumRw,
        perbaikan: perbaikanRw,
        rts: rtsBreakdown,
      };
    });
  }, [rws, rts, voters]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PANITIA PEMILIHAN KEPALA DESA', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text(settings.namaDesa.toUpperCase(), 105, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${settings.kecamatan}, ${settings.kabupaten}, Provinsi ${settings.provinsi}`,
      105,
      34,
      { align: 'center' }
    );
    const pilkadesDateStr = settings.tanggalPelaksanaan
      ? ` | Hari H: ${settings.tanggalPelaksanaan.split('-').reverse().join('-')}`
      : '';
    doc.text(`Periode: ${settings.periodePilkades}${pilkadesDateStr} | Alamat: ${settings.alamatKantor}`, 105, 39, {
      align: 'center',
    });
    doc.line(20, 42, 190, 42);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('BERITA ACARA REKAPITULASI DAFTAR PEMILIH TETAP (DPT)', 105, 52, { align: 'center' });

    let y = 62;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('No.', 20, y);
    doc.text('Wilayah RW', 30, y);
    doc.text('Jumlah RT', 90, y);
    doc.text('Sudah Verifikasi', 120, y);
    doc.text('Total Pemilih', 160, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 7;

    doc.setFont('helvetica', 'normal');
    rekapData.forEach((rw, idx) => {
      doc.text(String(idx + 1), 20, y);
      doc.text(`RW ${rw.rwNomor} (${rw.rwNama})`, 30, y);
      doc.text(String(rw.rts.length), 95, y);
      doc.text(String(rw.sudah), 130, y);
      doc.text(`${rw.total} Jiwa`, 165, y);
      y += 6;
    });

    doc.line(20, y, 190, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL SELURUH DESA:', 30, y);
    doc.text(`${voters.length} Jiwa`, 165, y);

    // Signatures
    y += 25;
    doc.setFont('helvetica', 'normal');
    doc.text(`Ditetapkan di: ${settings.namaDesa}`, 130, y);
    doc.text(`Pada tanggal: ${new Date().toLocaleDateString('id-ID')}`, 130, y + 5);

    y += 15;
    doc.text('Ketua Panitia Pilkades,', 30, y);
    doc.text('Sekretaris Panitia,', 130, y);

    y += 25;
    doc.setFont('helvetica', 'bold');
    doc.text(settings.namaKetuaPanitia, 30, y);
    doc.text(settings.namaSekretaris, 130, y);

    doc.save(`Rekapitulasi_DPT_${settings.namaDesa.replace(/\s+/g, '_')}.pdf`);
  };

  const handleExportExcel = () => {
    const rows = filteredVoters.map((v, i) => ({
      No: i + 1,
      NIK: v.nik || '-',
      'No. KK': v.noKk || '-',
      'Nama Lengkap': v.namaLengkap,
      'Tempat Lahir': v.tempatLahir || '-',
      'Tanggal Lahir': v.tanggalLahir ? v.tanggalLahir.split('-').reverse().join('-') : '-',
      'Usia pd Hari H': v.usiaPadaPilkades !== undefined ? `${v.usiaPadaPilkades} Tahun` : '-',
      'Jenis Kelamin': v.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-Laki',
      'Status Kawin':
        v.statusPerkawinan === 'S' ? 'Kawin (S)' : v.statusPerkawinan === 'P' ? 'Pernah Kawin (P)' : 'Belum Kawin (B)',
      Dusun: v.dusunNama || '-',
      RW: v.rw,
      RT: v.rt,
      Alamat: v.alamat,
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
      Keterangan: v.keterangan || '-',
      'Catatan Petugas': v.catatanVerifikasi || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan DPT');
    XLSX.writeFile(wb, `Laporan_DPT_${settings.namaDesa.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-800" />
            <span>Laporan & Berita Acara Rekapitulasi DPT</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen resmi penetapan Daftar Pemilih Tetap Pilkades untuk arsip panitia dan BPD.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Berita Acara (PDF)</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Official Letterhead & Rekapitulasi Preview */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Kop Surat Desa */}
        <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-900">
            PANITIA PEMILIHAN KEPALA DESA
          </div>
          <div className="text-xl font-bold uppercase tracking-wide text-slate-900">
            {settings.namaDesa}
          </div>
          <div className="text-xs text-slate-600">
            {settings.kecamatan}, {settings.kabupaten}, Provinsi {settings.provinsi}
          </div>
          <div className="text-[11px] text-slate-500">
            Sekretariat: {settings.alamatKantor} | Kontak: {settings.kontakSekretariat}
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center space-y-1">
          <h3 className="font-bold text-sm uppercase text-slate-900 underline tracking-wide">
            BERITA ACARA REKAPITULASI PENETAPAN DAFTAR PEMILIH TETAP (DPT)
          </h3>
          <p className="text-xs text-slate-600">
            Pemilihan Kepala Desa {settings.namaDesa} Periode {settings.periodePilkades}
          </p>
        </div>

        {/* Rekap Table */}
        <div className="overflow-x-auto border border-slate-300 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2.5 border-r border-slate-300 text-center w-12">No.</th>
                <th className="p-2.5 border-r border-slate-300">Wilayah Rukun Warga (RW)</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-24">Jumlah RT</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-36">Sudah Diverifikasi</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-32">Belum / Perbaikan</th>
                <th className="p-2.5 text-center w-36 font-bold">Total DPT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {rekapData.map((rw, idx) => (
                <React.Fragment key={rw.rwNomor}>
                  <tr className="bg-slate-50 font-semibold">
                    <td className="p-2.5 text-center border-r border-slate-200">{idx + 1}</td>
                    <td className="p-2.5 border-r border-slate-200">
                      RW {rw.rwNomor} - {rw.rwNama}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 font-mono">
                      {rw.rts.length} RT
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 text-emerald-800 font-bold font-mono">
                      {rw.sudah}
                    </td>
                    <td className="p-2.5 text-center border-r border-slate-200 text-amber-700 font-mono">
                      {rw.belum + rw.perbaikan}
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 font-mono">
                      {rw.total} Jiwa
                    </td>
                  </tr>

                  {/* RT sub-rows */}
                  {rw.rts.map((rt) => (
                    <tr key={rt.rtNomor} className="text-[11px] text-slate-600">
                      <td className="p-1.5 text-center border-r border-slate-200"></td>
                      <td className="p-1.5 pl-6 border-r border-slate-200">
                        • RT {rt.rtNomor} ({rt.nama})
                      </td>
                      <td className="p-1.5 text-center border-r border-slate-200">-</td>
                      <td className="p-1.5 text-center border-r border-slate-200 text-emerald-700 font-mono">
                        {rt.sudah}
                      </td>
                      <td className="p-1.5 text-center border-r border-slate-200 text-amber-600 font-mono">
                        {rt.belum + rt.perbaikan}
                      </td>
                      <td className="p-1.5 text-center font-mono text-slate-800 font-semibold">
                        {rt.total}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* Total Row */}
              <tr className="bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-400">
                <td colSpan={2} className="p-3 text-right border-r border-slate-300">
                  TOTAL KESELURUHAN DPT DESA:
                </td>
                <td className="p-3 text-center border-r border-slate-300 font-mono">
                  {rts.length} RT
                </td>
                <td className="p-3 text-center border-r border-slate-300 text-emerald-800 font-mono">
                  {voters.filter((v) => v.statusVerifikasi === 'sudah_diverifikasi').length}
                </td>
                <td className="p-3 text-center border-r border-slate-300 text-amber-800 font-mono">
                  {voters.filter((v) => v.statusVerifikasi !== 'sudah_diverifikasi').length}
                </td>
                <td className="p-3 text-center font-bold text-slate-900 font-mono text-sm">
                  {voters.length} Jiwa
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Committee Signatures */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-slate-800">
          <div className="text-center space-y-16">
            <div>
              <p>Mengetahui / Menyetujui,</p>
              <p className="font-bold">Ketua Panitia Pemilihan Kepala Desa</p>
            </div>
            <div>
              <p className="font-bold underline uppercase">{settings.namaKetuaPanitia}</p>
              <p className="text-[11px] text-slate-500">Ketua Panitia DPT</p>
            </div>
          </div>

          <div className="text-center space-y-16">
            <div>
              <p>{settings.namaDesa}, {new Date().toLocaleDateString('id-ID')}</p>
              <p className="font-bold">Sekretaris Panitia</p>
            </div>
            <div>
              <p className="font-bold underline uppercase">{settings.namaSekretaris}</p>
              <p className="text-[11px] text-slate-500">Sekretaris Panitia DPT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
