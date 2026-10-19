import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Table,
  Upload,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportDataProps {
  onSuccessImport: (count: number) => void;
}

export const ImportData: React.FC<ImportDataProps> = ({ onSuccessImport }) => {
  const { currentUser } = useAuth();
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NIK': '3211011508820001',
        'No. KK': '3211011002080005',
        'Nama Lengkap': 'Budi Santoso',
        'Tempat Lahir': 'Sumedang',
        'Tanggal Lahir': '15-08-1982',
        'Jenis Kelamin': 'L',
        'Status Kawin': 'S',
        'Dusun': 'Dusun Krajan',
        'RW': '001',
        'RT': '001',
        'Alamat Domisili': 'Jl. Merpati No. 12',
        'Nomor Identifikasi': 'DPT-REG-001',
        'Keterangan': 'Warga Asli Tetap',
      },
      {
        'NIK': '3211015204880002',
        'No. KK': '3211011002080005',
        'Nama Lengkap': 'Siti Aminah',
        'Tempat Lahir': 'Bandung',
        'Tanggal Lahir': '12-04-1988',
        'Jenis Kelamin': 'P',
        'Status Kawin': 'S',
        'Dusun': 'Dusun Krajan',
        'RW': '001',
        'RT': '001',
        'Alamat Domisili': 'Jl. Kenanga No. 04',
        'Nomor Identifikasi': 'DPT-REG-002',
        'Keterangan': 'Ibu Rumah Tangga',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template DPT');
    XLSX.writeFile(wb, 'Format_Impor_DPT_Pilkades.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('File kosong atau format lembar kerja tidak sesuai.');
          return;
        }

        const normalized = rawJson.map((row: any) => {
          const nik = String(row['NIK'] || row['nik'] || '').replace(/\D/g, '').trim();
          const noKk = String(row['No. KK'] || row['No KK'] || row['noKk'] || '').replace(/\D/g, '').trim();
          const namaLengkap =
            row['Nama Lengkap'] ||
            row['namaLengkap'] ||
            row['Nama'] ||
            row['NAMA'] ||
            '';
          const tempatLahir = row['Tempat Lahir'] || row['tempatLahir'] || '';
          const tglLahirRaw = row['Tanggal Lahir'] || row['tanggalLahir'] || row['Tgl Lahir'] || '';
          const jkRaw = String(row['Jenis Kelamin'] || row['jenisKelamin'] || row['JK'] || 'L').toUpperCase().trim();
          const jenisKelamin = jkRaw.startsWith('P') || jkRaw.startsWith('W') ? 'P' : 'L';
          const kawinRaw = String(row['Status Kawin'] || row['statusPerkawinan'] || row['Status'] || 'B').toUpperCase().trim();
          const statusPerkawinan = kawinRaw.startsWith('S') || kawinRaw.includes('KAWIN') ? 'S' : kawinRaw.startsWith('P') || kawinRaw.includes('CERAI') ? 'P' : 'B';
          const dusunNama = row['Dusun'] || row['dusun'] || row['dusunNama'] || '';
          const alamat =
            row['Alamat Domisili'] ||
            row['Alamat'] ||
            row['alamat'] ||
            row['ALAMAT'] ||
            '';
          const rt = String(row['RT'] || row['rt'] || '001').trim();
          const rw = String(row['RW'] || row['rw'] || '001').trim();
          const nomorId =
            row['Nomor Identifikasi'] ||
            row['No. Identifikasi'] ||
            row['nomorIdentifikasiInternal'] ||
            '';
          const keterangan = row['Keterangan'] || row['keterangan'] || '';

          return {
            nik: nik || undefined,
            noKk: noKk || undefined,
            namaLengkap: String(namaLengkap).trim(),
            tempatLahir: String(tempatLahir).trim() || undefined,
            tanggalLahir: String(tglLahirRaw).trim() || undefined,
            jenisKelamin: jenisKelamin as 'L' | 'P',
            statusPerkawinan: statusPerkawinan as 'B' | 'S' | 'P',
            dusunNama: String(dusunNama).trim() || undefined,
            alamat: String(alamat).trim(),
            rt,
            rw,
            nomorIdentifikasiInternal: String(nomorId).trim() || undefined,
            keterangan: String(keterangan).trim() || undefined,
          };
        });

        const validList = normalized.filter((item) => item.namaLengkap && item.alamat);
        if (validList.length === 0) {
          setErrorMsg(
            'Tidak ada data valid yang dapat dibaca. Pastikan kolom "Nama Lengkap" dan "Alamat" tersedia.'
          );
          return;
        }

        setParsedData(validList);
      } catch (err: unknown) {
        setErrorMsg('Gagal membaca berkas Excel/CSV. Pastikan format file benar.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleProcessImport = () => {
    if (!currentUser || parsedData.length === 0) return;
    setIsProcessing(true);

    try {
      const count = StorageService.addVotersBatch(parsedData, currentUser);
      setParsedData([]);
      setFileName('');
      onSuccessImport(count);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
            <span>Impor Data Pemilih (Excel / CSV)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah file rekapitulasi data kependudukan desa untuk ditambahkan sekaligus ke basis data
            DPT.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-800" />
          <span>Unduh Format Excel</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-300 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
          <FileUp className="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Pilih File Excel (.xlsx / .xls) atau CSV</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Sistem secara otomatis memetakan kolom Nama Lengkap, Alamat Domisili, RT, dan RW sesuai
            format standar.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors">
            <Upload className="w-4 h-4" />
            <span>Pilih Berkas Dari Komputer</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {fileName && (
            <p className="text-xs text-slate-600 font-mono mt-2">
              Berkas dipilih: <strong className="text-emerald-800">{fileName}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Preview Table */}
      {parsedData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-800" />
                <span>Pratinjau Data ({parsedData.length} Warga Terdeteksi)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Periksa kembali baris data sebelum menyimpannya ke basis data utama.
              </p>
            </div>

            <button
              onClick={handleProcessImport}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? 'Mengimpor...' : `Konfirmasi Impor ${parsedData.length} Data`}</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold sticky top-0">
                <tr>
                  <th className="px-3.5 py-2.5 w-12 text-center">No.</th>
                  <th className="px-3.5 py-2.5">Nama Lengkap</th>
                  <th className="px-3.5 py-2.5">Alamat Domisili</th>
                  <th className="px-3 py-2.5 text-center w-16">RT</th>
                  <th className="px-3 py-2.5 text-center w-16">RW</th>
                  <th className="px-3.5 py-2.5">Nomor Identifikasi</th>
                  <th className="px-3.5 py-2.5">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedData.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="px-3.5 py-2 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="px-3.5 py-2 font-bold text-slate-900">{row.namaLengkap}</td>
                    <td className="px-3.5 py-2">{row.alamat}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold bg-slate-50">
                      {row.rt}
                    </td>
                    <td className="px-3 py-2 text-center font-mono font-bold bg-slate-50">
                      {row.rw}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-slate-500">
                      {row.nomorIdentifikasiInternal || '-'}
                    </td>
                    <td className="px-3.5 py-2 text-slate-500 italic">{row.keterangan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedData.length > 50 && (
            <p className="text-[11px] text-slate-400 italic text-center">
              Menampilkan 50 data teratas dari {parsedData.length} data yang akan diimpor.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
