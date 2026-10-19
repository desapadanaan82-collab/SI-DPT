import React, { useMemo, useState } from 'react';
import { DesaSettings, Dusun, GenderType, MaritalStatusType, RT, RW, Voter } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Info,
  MapPin,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import {
  calculateAge,
  evaluateVoterEligibility,
  formatDateToLong,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  normalizeDateToISO,
  validateKk,
  validateNik,
} from '../../utils/dateUtils';
import { EligibilityBadge } from '../StatusBadge';

interface AddVoterModalProps {
  isOpen: boolean;
  dusuns?: Dusun[];
  rws: RW[];
  rts: RT[];
  settings?: DesaSettings;
  onClose: () => void;
  onSuccess: (voter: Voter, message: string) => void;
}

export const AddVoterModal: React.FC<AddVoterModalProps> = ({
  isOpen,
  dusuns = [],
  rws,
  rts,
  settings,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();

  // Form states
  const [nik, setNik] = useState('');
  const [noKk, setNoKk] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<GenderType>('L');
  const [statusPerkawinan, setStatusPerkawinan] = useState<MaritalStatusType>('B');

  const [selectedDusunId, setSelectedDusunId] = useState('');
  const [selectedRw, setSelectedRw] = useState('');
  const [selectedRt, setSelectedRt] = useState('');
  const [alamat, setAlamat] = useState('');

  const [nomorId, setNomorId] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Validation messages
  const [errorMsg, setErrorMsg] = useState('');
  const [nikWarning, setNikWarning] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Filter RW by selected Dusun
  const availableRws = useMemo(() => {
    if (!selectedDusunId) return rws;
    return rws.filter((rw) => rw.dusunId === selectedDusunId);
  }, [rws, selectedDusunId]);

  // Filter RT by selected RW
  const availableRts = useMemo(() => {
    if (!selectedRw) return rts;
    return rts.filter((r) => r.rwNomor === selectedRw);
  }, [selectedRw, rts]);

  // Dynamic live eligibility preview on election date
  const eligibilityPreview = useMemo(() => {
    return evaluateVoterEligibility(
      {
        tanggalLahir,
        statusPerkawinan,
        statusVerifikasi: 'belum_diverifikasi',
      },
      settings?.tanggalPelaksanaan
    );
  }, [tanggalLahir, statusPerkawinan, settings?.tanggalPelaksanaan]);

  if (!isOpen) return null;

  // Handle NIK input & duplicate check
  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    setNik(val);
    if (val.length === 16) {
      const dup = StorageService.checkNikDuplicate(val);
      if (dup.isDuplicate) {
        setNikWarning(dup.reason);
      } else {
        setNikWarning(null);
      }
    } else {
      setNikWarning(null);
    }
  };

  const handleKkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    setNoKk(val);
  };

  const handleDusunChange = (dusunId: string) => {
    setSelectedDusunId(dusunId);
    setSelectedRw('');
    setSelectedRt('');
  };

  const handleRwChange = (rwNomor: string) => {
    setSelectedRw(rwNomor);
    setSelectedRt('');
    // Auto sync Dusun if RW is mapped to a Dusun
    if (rwNomor) {
      const rwObj = rws.find((r) => r.nomor === rwNomor);
      if (rwObj && rwObj.dusunId) {
        setSelectedDusunId(rwObj.dusunId);
      }
    }
  };

  const handleNameOrAddressBlur = () => {
    if (namaLengkap.trim() && selectedRw && selectedRt) {
      const check = StorageService.checkPotentialDuplicate({
        namaLengkap,
        alamat,
        rt: selectedRt,
        rw: selectedRw,
      });
      if (check.isDuplicate) {
        setDuplicateWarning(check.reason);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg('Pengguna tidak terautentikasi.');
      return;
    }

    if (!namaLengkap.trim()) {
      setErrorMsg('Nama lengkap pemilih wajib diisi.');
      return;
    }

    if (!alamat.trim()) {
      setErrorMsg('Alamat domisili lengkap wajib diisi.');
      return;
    }

    if (!selectedRw || !selectedRt) {
      setErrorMsg('Wilayah RW dan RT wajib dipilih.');
      return;
    }

    if (nik.trim()) {
      const nikCheck = validateNik(nik);
      if (!nikCheck.isValid) {
        setErrorMsg(nikCheck.message);
        return;
      }
      const dupCheck = StorageService.checkNikDuplicate(nik);
      if (dupCheck.isDuplicate) {
        setErrorMsg(dupCheck.reason);
        return;
      }
    }

    if (noKk.trim()) {
      const kkCheck = validateKk(noKk);
      if (!kkCheck.isValid) {
        setErrorMsg(kkCheck.message);
        return;
      }
    }

    const dusunObj = dusuns.find((d) => d.id === selectedDusunId);

    try {
      const voter = StorageService.addVoter(
        {
          nik: nik.trim() || undefined,
          noKk: noKk.trim() || undefined,
          namaLengkap: namaLengkap.trim(),
          tempatLahir: tempatLahir.trim() || undefined,
          tanggalLahir: tanggalLahir || undefined,
          jenisKelamin,
          statusPerkawinan,
          alamat: alamat.trim(),
          dusunId: selectedDusunId || undefined,
          dusunNama: dusunObj?.nama || undefined,
          rt: selectedRt,
          rw: selectedRw,
          nomorIdentifikasiInternal: nomorId.trim() || undefined,
          keterangan: keterangan.trim() || undefined,
        },
        currentUser
      );

      // Reset form
      setNik('');
      setNoKk('');
      setNamaLengkap('');
      setTempatLahir('');
      setTanggalLahir('');
      setJenisKelamin('L');
      setStatusPerkawinan('B');
      setSelectedDusunId('');
      setSelectedRw('');
      setSelectedRt('');
      setAlamat('');
      setNomorId('');
      setKeterangan('');
      setNikWarning(null);
      setDuplicateWarning(null);

      onSuccess(voter, `Data pemilih "${voter.namaLengkap}" berhasil ditambahkan ke DPT.`);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <UserPlus className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pendaftaran Calon Pemilih Baru</h3>
              <p className="text-xs text-slate-500">
                Lengkapi identitas kependudukan, tanggal lahir, dan wilayah domisili calon pemilih
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {nikWarning && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Peringatan Duplikasi NIK:</p>
              <p className="text-[11px] mt-0.5">{nikWarning}</p>
            </div>
          </div>
        )}

        {duplicateWarning && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Peringatan Potensi Kesamaan Data:</p>
              <p className="text-[11px] mt-0.5">{duplicateWarning}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Identitas Kependudukan */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-xs font-bold text-slate-800">
              <User className="w-4 h-4 text-emerald-800" />
              <span>1. Identitas Kependudukan Pemilih</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>NIK (Nomor Induk Kependudukan)</span>
                  <span className={`text-[10px] font-mono ${nik.length === 16 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    {nik.length}/16 Digit
                  </span>
                </label>
                <input
                  type="text"
                  value={nik}
                  onChange={handleNikChange}
                  placeholder="Contoh: 3211011508820001"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono bg-white focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Nomor Kartu Keluarga (KK)</span>
                  <span className={`text-[10px] font-mono ${noKk.length === 16 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    {noKk.length}/16 Digit
                  </span>
                </label>
                <input
                  type="text"
                  value={noKk}
                  onChange={handleKkChange}
                  placeholder="Contoh: 3211011002080005"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono bg-white focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Pemilih <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  onBlur={handleNameOrAddressBlur}
                  placeholder="Nama sesuai KTP-el / KK"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-4 pt-1">
                  {GENDER_OPTIONS.map((g) => (
                    <label key={g.value} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="jenisKelamin"
                        value={g.value}
                        checked={jenisKelamin === g.value}
                        onChange={() => setJenisKelamin(g.value)}
                        className="text-emerald-700 focus:ring-emerald-700"
                      />
                      <span>{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Perkawinan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={statusPerkawinan}
                  onChange={(e) => setStatusPerkawinan(e.target.value as MaritalStatusType)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                >
                  {MARITAL_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Kelahiran & Kelayakan Usia */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-800" />
                <span>2. Data Kelahiran & Acuan Usia Pilkades</span>
              </div>
              {settings?.tanggalPelaksanaan && (
                <span className="text-[10px] text-slate-500 font-normal">
                  Hari H: {formatDateToLong(settings.tanggalPelaksanaan)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={tempatLahir}
                  onChange={(e) => setTempatLahir(e.target.value)}
                  placeholder="Kota / Kabupaten Kelahiran"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Tanggal Lahir</span>
                  <span className="text-[10px] text-slate-500">Format: DD-MM-YYYY</span>
                </label>
                <input
                  type="date"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Live Age & Eligibility Banner */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  Indikasi Kelayakan Hak Pilih pada Hari Pilkades:
                </span>
                <EligibilityBadge status={eligibilityPreview.status} size="sm" />
              </div>

              {eligibilityPreview.usiaText && (
                <div className="text-xs text-slate-800 font-medium flex items-center gap-2">
                  <span>Usia pada Hari Pelaksanaan:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {eligibilityPreview.usiaText}
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                {eligibilityPreview.alasan}
              </p>
            </div>
          </div>

          {/* Section 3: Wilayah & Alamat */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-emerald-800" />
              <span>3. Wilayah Domisili (Dusun, RW, RT)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {dusuns.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Wilayah Dusun</label>
                  <select
                    value={selectedDusunId}
                    onChange={(e) => handleDusunChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="">-- Pilih Dusun --</option>
                    {dusuns.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wilayah RW <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRw}
                  onChange={(e) => handleRwChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                  required
                >
                  <option value="">-- Pilih RW --</option>
                  {availableRws.map((rw) => (
                    <option key={rw.id} value={rw.nomor}>
                      RW {rw.nomor} - {rw.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wilayah RT <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRt}
                  onChange={(e) => setSelectedRt(e.target.value)}
                  disabled={!selectedRw}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700 disabled:bg-slate-100"
                  required
                >
                  <option value="">-- Pilih RT --</option>
                  {availableRts.map((rt) => (
                    <option key={rt.id} value={rt.nomor}>
                      RT {rt.nomor} ({rt.nama || `RW ${rt.rwNomor}`})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Domisili Lengkap <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                onBlur={handleNameOrAddressBlur}
                placeholder="Jl. / Gang, Nomor Rumah, Dusun / Blok"
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-700"
                required
              />
            </div>
          </div>

          {/* Section 4: Keterangan Tambahan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Identifikasi Internal / Buku DPT
              </label>
              <input
                type="text"
                value={nomorId}
                onChange={(e) => setNomorId(e.target.value)}
                placeholder="Misal: DPT-2026-001"
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan / Catatan Tambahan
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Misal: Warga Asli, Disabilitas, Pensiunan, dll."
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              Simpan Data Pemilih
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
