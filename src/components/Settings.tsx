import React, { useState } from 'react';
import { DesaSettings } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Building, Save, ShieldAlert } from 'lucide-react';

interface SettingsProps {
  settings: DesaSettings;
  onUpdateSettings: (settings: DesaSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const { currentUser, isAdmin } = useAuth();
  const [form, setForm] = useState<DesaSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Akses Terbatas</h3>
        <p className="text-xs text-slate-500 mt-1">
          Hanya Administrator yang berwenang mengubah informasi desa dan kepanitiaan.
        </p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    StorageService.updateSettings(form, currentUser);
    onUpdateSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-800" />
            <span>Pengaturan Identitas Desa & Kepanitiaan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi ini digunakan otomatis pada kop surat, judul laporan DPT, dan tanda tangan
            berita acara pleno.
          </p>
        </div>

        {isSaved && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg border border-emerald-300">
            Perubahan Berhasil Disimpan!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Identitas Wilayah Administrasi Desa</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Desa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="namaDesa"
              value={form.namaDesa}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kecamatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="kecamatan"
              value={form.kecamatan}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kabupaten / Kota <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="kabupaten"
              value={form.kabupaten}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Provinsi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="provinsi"
              value={form.provinsi}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Periode Pilkades (Tahun)
            </label>
            <input
              type="text"
              name="periodePilkades"
              value={form.periodePilkades}
              onChange={handleChange}
              placeholder="2026 - 2032"
              className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>
                Tanggal Pelaksanaan Pilkades <span className="text-emerald-700 font-bold">(Acuan Usia Pemilih)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Format: DD-MM-YYYY</span>
            </label>
            <input
              type="date"
              name="tanggalPelaksanaan"
              value={form.tanggalPelaksanaan || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs bg-emerald-50/30 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
            {form.tanggalPelaksanaan ? (
              <div className="mt-1.5 flex items-center justify-between text-[11px] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 text-emerald-800">
                <span>
                  Format Tampilan: <strong className="font-mono">{form.tanggalPelaksanaan.split('-').reverse().join('-')}</strong>
                </span>
                <span className="font-medium">
                  {new Date(form.tanggalPelaksanaan + 'T00:00:00').toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-amber-700 mt-1">
                ⚠️ Belum ditentukan. Perhitungan usia otomatis pemilih pada hari pemilihan belum dapat dinilai.
              </p>
            )}
          </div>
        </div>

        {/* Warning banner if Tanggal Pelaksanaan is not filled */}
        {!form.tanggalPelaksanaan && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <span className="text-amber-600 text-base leading-none mt-0.5">⚠️</span>
            <div className="space-y-0.5">
              <p className="font-bold">Peringatan: Tanggal Pelaksanaan Pilkades Belum Ditentukan</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Tanggal pelaksanaan menjadi acuan penentuan hak pilih dan perhitungan usia otomatis (apakah calon pemilih telah genap berusia 17 tahun pada hari pemungutan suara). Jika tanggal belum disetel, status kelayakan seluruh calon pemilih akan berstatus <em>"Belum Dapat Dinilai"</em>.
              </p>
            </div>
          </div>
        )}

        <div className="border-b border-slate-100 pb-3 pt-3">
          <h3 className="text-sm font-bold text-slate-900">Kepanitiaan & Kontak Sekretariat</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Ketua Panitia
            </label>
            <input
              type="text"
              name="namaKetuaPanitia"
              value={form.namaKetuaPanitia}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Sekretaris Panitia
            </label>
            <input
              type="text"
              name="namaSekretaris"
              value={form.namaSekretaris}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Kantor Sekretariat Panitia
            </label>
            <input
              type="text"
              name="alamatKantor"
              value={form.alamatKantor}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kontak / Nomor Telepon Sekretariat
            </label>
            <input
              type="text"
              name="kontakSekretariat"
              value={form.kontakSekretariat}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan Desa</span>
          </button>
        </div>
      </form>
    </div>
  );
};
