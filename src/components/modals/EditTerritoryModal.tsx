import React, { useEffect, useState } from 'react';
import { Dusun, RT, RW } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Building2, MapPin, X } from 'lucide-react';

export type TerritoryType = 'dusun' | 'rw' | 'rt';

interface EditTerritoryModalProps {
  isOpen: boolean;
  type: TerritoryType;
  item: Dusun | RW | RT | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const EditTerritoryModal: React.FC<EditTerritoryModalProps> = ({
  isOpen,
  type,
  item,
  onClose,
  onSuccess,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [nama, setNama] = useState('');
  const [nomor, setNomor] = useState('');
  const [selectedDusunId, setSelectedDusunId] = useState('');
  const [selectedRwNomor, setSelectedRwNomor] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dusuns = StorageService.getDusuns();
  const rws = StorageService.getRWs();

  useEffect(() => {
    if (isOpen && item) {
      setErrorMsg('');
      setNama(item.nama || '');
      setKeterangan(item.keterangan || '');

      if (type === 'rw') {
        const rwItem = item as RW;
        setNomor(rwItem.nomor || '');
        setSelectedDusunId(rwItem.dusunId || (dusuns.length > 0 ? dusuns[0].id : ''));
      } else if (type === 'rt') {
        const rtItem = item as RT;
        setNomor(rtItem.nomor || '');
        setSelectedRwNomor(rtItem.rwNomor || (rws.length > 0 ? rws[0].nomor : ''));
      }
    }
  }, [isOpen, item, type]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser || !isAdmin) {
      setErrorMsg('Hanya Administrator yang memiliki wewenang untuk mengubah data wilayah.');
      return;
    }

    const trimmedNama = nama.replace(/\s+/g, ' ').trim();
    if (!trimmedNama) {
      setErrorMsg('Nama wilayah wajib diisi dan tidak boleh hanya berupa spasi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (type === 'dusun') {
        const updated = StorageService.updateDusun(
          item.id,
          {
            nama: trimmedNama,
            keterangan: keterangan.trim(),
          },
          currentUser
        );
        onSuccess(`Wilayah Dusun berhasil diperbarui menjadi "${updated.nama}".`);
        onClose();
      } else if (type === 'rw') {
        const trimmedNomor = nomor.trim();
        if (!trimmedNomor) {
          setErrorMsg('Nomor RW wajib diisi.');
          setIsSubmitting(false);
          return;
        }

        const updated = StorageService.updateRW(
          item.id,
          {
            nomor: trimmedNomor,
            nama: trimmedNama,
            dusunId: selectedDusunId,
            keterangan: keterangan.trim(),
          },
          currentUser
        );
        onSuccess(
          `Wilayah RW ${updated.nomor} ("${updated.nama}") berhasil diperbarui dan relasi pemilih tetap aman.`
        );
        onClose();
      } else if (type === 'rt') {
        const trimmedNomor = nomor.trim();
        if (!trimmedNomor) {
          setErrorMsg('Nomor RT wajib diisi.');
          setIsSubmitting(false);
          return;
        }
        if (!selectedRwNomor) {
          setErrorMsg('RW Induk wajib dipilih.');
          setIsSubmitting(false);
          return;
        }

        const updated = StorageService.updateRT(
          item.id,
          {
            nomor: trimmedNomor,
            rwNomor: selectedRwNomor,
            nama: trimmedNama,
            keterangan: keterangan.trim(),
          },
          currentUser
        );
        onSuccess(
          `Wilayah RT ${updated.nomor} (RW ${updated.rwNomor}) berhasil diperbarui dan relasi pemilih tetap aman.`
        );
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabel =
    type === 'dusun' ? 'Dusun' : type === 'rw' ? 'Rukun Warga (RW)' : 'Rukun Tetangga (RT)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              {type === 'dusun' ? (
                <Building2 className="w-5 h-5 text-emerald-700" />
              ) : (
                <MapPin className="w-5 h-5 text-emerald-700" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Ubah Data {typeLabel}</h3>
              <p className="text-[11px] text-slate-500">
                ID Wilayah: <span className="font-mono text-slate-700 font-semibold">{item.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* RW: Parent Dusun selector */}
          {type === 'rw' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dusun Induk <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedDusunId}
                onChange={(e) => setSelectedDusunId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              >
                <option value="">-- Pilih Dusun Induk --</option>
                {dusuns.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Mempertahankan hierarki wilayah Dusun yang menaungi RW ini.
              </p>
            </div>
          )}

          {/* RT: Parent RW selector */}
          {type === 'rt' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                RW Induk <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedRwNomor}
                onChange={(e) => setSelectedRwNomor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              >
                <option value="">-- Pilih RW Induk --</option>
                {rws.map((rw) => (
                  <option key={rw.id} value={rw.nomor}>
                    RW {rw.nomor} - {rw.nama} {rw.dusunNama ? `(${rw.dusunNama})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                RT ini terikat di bawah RW yang dipilih.
              </p>
            </div>
          )}

          {/* Nomor (for RW & RT) */}
          {(type === 'rw' || type === 'rt') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor {type === 'rw' ? 'RW' : 'RT'} (teks/angka 3 digit){' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nomor}
                onChange={(e) => setNomor(e.target.value)}
                placeholder={type === 'rw' ? '001' : '001'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                required
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Format penomoran standar 3 digit (contoh: 001, 002).
              </p>
            </div>
          )}

          {/* Nama Wilayah */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Wilayah {typeLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder={
                type === 'dusun'
                  ? 'Contoh: Dusun Krajan'
                  : type === 'rw'
                  ? 'Contoh: RW 001 - Dusun Krajan'
                  : 'Contoh: RT 001 / RW 001'
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Nama wilayah akan dinormalisasi secara otomatis (menghapus spasi ganda berlebih).
            </p>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Wilayah (Opsional)
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan geografis, batas wilayah, atau keterangan penting..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700 resize-none"
            />
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed">
            <span className="font-semibold text-emerald-800">Perlindungan Relasi:</span> Perubahan nama
            tidak akan merusak atau memutuskan relasi data pemilih yang sudah terdaftar. Referensi ID
            wilayah dipertahankan di database.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
