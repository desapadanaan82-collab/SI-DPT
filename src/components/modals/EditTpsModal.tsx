import React, { useEffect, useState } from 'react';
import { Dusun, RT, RW, TPS, TpsStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { TpsMap } from '../TpsMap';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MapPin,
  X,
} from 'lucide-react';

interface EditTpsModalProps {
  isOpen: boolean;
  tps: TPS | null;
  dusuns: Dusun[];
  rws: RW[];
  rts: RT[];
  onClose: () => void;
  onSuccess: (updatedTps: TPS, message: string) => void;
}

export const EditTpsModal: React.FC<EditTpsModalProps> = ({
  isOpen,
  tps,
  dusuns,
  rws,
  rts,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();

  const [nomor, setNomor] = useState('');
  const [nama, setNama] = useState('');
  const [namaTempat, setNamaTempat] = useState('');
  const [dusunId, setDusunId] = useState('');
  const [rw, setRw] = useState('');
  const [rt, setRt] = useState('');
  const [alamat, setAlamat] = useState('');
  const [latitude, setLatitude] = useState(-6.8924);
  const [longitude, setLongitude] = useState(107.9852);
  const [kapasitas, setKapasitas] = useState(300);
  const [aksesibilitas, setAksesibilitas] = useState('');
  const [status, setStatus] = useState<TpsStatus>('ditetapkan');
  const [namaKetuaKpks, setNamaKetuaKpks] = useState('');
  const [kontakPetugas, setKontakPetugas] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tps) {
      setNomor(tps.nomor);
      setNama(tps.nama);
      setNamaTempat(tps.namaTempat || '');
      setDusunId(tps.dusunId || '');
      setRw(tps.rw || '');
      setRt(tps.rt || '');
      setAlamat(tps.alamat || '');
      setLatitude(tps.latitude);
      setLongitude(tps.longitude);
      setKapasitas(tps.kapasitas || 300);
      setAksesibilitas(tps.aksesibilitas || '');
      setStatus(tps.status || 'ditetapkan');
      setNamaKetuaKpks(tps.namaKetuaKpks || '');
      setKontakPetugas(tps.kontakPetugas || '');
      setKeterangan(tps.keterangan || '');
      setErrorMsg('');
      setWarningMsg('');
    }
  }, [tps]);

  if (!isOpen || !tps) return null;

  const handleCoordinatesChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    const check = StorageService.checkDuplicateCoordinates(lat, lng, tps.id);
    if (check.isTooClose && check.message) {
      setWarningMsg(check.message);
    } else {
      setWarningMsg('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg('Anda harus masuk sebagai operator atau administrator.');
      return;
    }

    if (!nomor.trim()) {
      setErrorMsg('Nomor TPS wajib diisi.');
      return;
    }

    if (!nama.trim()) {
      setErrorMsg('Nama TPS wajib diisi.');
      return;
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      setErrorMsg('Koordinat Latitude dan Longitude harus berupa angka desimal.');
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedDusun = dusuns.find((d) => d.id === dusunId);

      const updated = StorageService.updateTPS(
        tps.id,
        {
          nomor: nomor.trim(),
          nama: nama.trim(),
          namaTempat: namaTempat.trim() || nama.trim(),
          dusunId: dusunId || undefined,
          dusunNama: selectedDusun ? selectedDusun.nama : undefined,
          rw: rw.trim() || undefined,
          rt: rt.trim() || undefined,
          alamat: alamat.trim(),
          latitude: Number(latitude),
          longitude: Number(longitude),
          kapasitas: Number(kapasitas) || 300,
          aksesibilitas: aksesibilitas.trim(),
          status,
          namaKetuaKpks: namaKetuaKpks.trim() || undefined,
          kontakPetugas: kontakPetugas.trim() || undefined,
          keterangan: keterangan.trim() || undefined,
        },
        currentUser
      );

      onSuccess(updated, `Perubahan data TPS ${updated.nomor} berhasil disimpan.`);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700/60 rounded-xl">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Edit Data TPS {tps.nomor}
              </h3>
              <p className="text-xs text-emerald-200">{tps.nama}</p>
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {warningMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>{warningMsg}</div>
            </div>
          )}

          {/* Nomor, Nama, & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor TPS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nomor}
                onChange={(e) => setNomor(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 font-semibold"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap TPS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lokasi / Tempat
              </label>
              <input
                type="text"
                value={namaTempat}
                onChange={(e) => setNamaTempat(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Penetapan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TpsStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value="ditetapkan">Ditetapkan (Resmi)</option>
                <option value="usulan">Usulan Panitia</option>
                <option value="rancangan">Rancangan Awal</option>
              </select>
            </div>
          </div>

          {/* Wilayah Relasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Wilayah Dusun
              </label>
              <select
                value={dusunId}
                onChange={(e) => setDusunId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value="">-- Pilih Dusun --</option>
                {dusuns.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cakupan RW
              </label>
              <input
                type="text"
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cakupan RT
              </label>
              <input
                type="text"
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Lengkap Lokasi TPS
            </label>
            <input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Map Picker & Coordinates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Titik Koordinat Peta TPS (Latitude & Longitude)</span>
              </label>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
              >
                <span>Cek di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <TpsMap
              tpsList={[]}
              isPickerMode={true}
              pickerLat={latitude}
              pickerLng={longitude}
              onCoordinatesChange={handleCoordinatesChange}
              height="260px"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Latitude (Garis Lintang)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => handleCoordinatesChange(parseFloat(e.target.value) || 0, longitude)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Longitude (Garis Bujur)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => handleCoordinatesChange(latitude, parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Kapasitas & Aksesibilitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kapasitas / Kuota Pemilih
              </label>
              <input
                type="number"
                min="50"
                max="1000"
                value={kapasitas}
                onChange={(e) => setKapasitas(parseInt(e.target.value) || 300)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Aksesibilitas Lokasi
              </label>
              <input
                type="text"
                value={aksesibilitas}
                onChange={(e) => setAksesibilitas(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Petugas & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ketua KPPS / Penanggung Jawab
              </label>
              <input
                type="text"
                value={namaKetuaKpks}
                onChange={(e) => setNamaKetuaKpks(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Kontak / WhatsApp
              </label>
              <input
                type="text"
                value={kontakPetugas}
                onChange={(e) => setKontakPetugas(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan & Keterangan Tambahan
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
