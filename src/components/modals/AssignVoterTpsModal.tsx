import React, { useMemo, useState } from 'react';
import { RT, RW, TPS, Voter } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  MapPin,
  Search,
  Users,
  X,
} from 'lucide-react';
import { maskNik } from '../../utils/dateUtils';

interface AssignVoterTpsModalProps {
  isOpen: boolean;
  tps: TPS | null;
  allTps: TPS[];
  voters: Voter[];
  rws: RW[];
  rts: RT[];
  onClose: () => void;
  onSuccess: (count: number, message: string) => void;
}

export const AssignVoterTpsModal: React.FC<AssignVoterTpsModalProps> = ({
  isOpen,
  tps,
  allTps,
  voters,
  rws,
  rts,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'territory' | 'individual'>('territory');

  // Territory batch allocation states
  const [selectedRw, setSelectedRw] = useState('');
  const [selectedRt, setSelectedRt] = useState('');

  // Individual selection states
  const [searchQuery, setSearchQuery] = useState('');
  const [tpsFilter, setTpsFilter] = useState<'all' | 'unassigned' | 'this_tps'>('unassigned');
  const [selectedVoterIds, setSelectedVoterIds] = useState<string[]>([]);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available RTs based on selected RW
  const filteredRts = useMemo(() => {
    if (!selectedRw) return rts;
    return rts.filter((r) => r.rwNomor === selectedRw);
  }, [rts, selectedRw]);

  // Voters matched by territory
  const territoryMatchedVoters = useMemo(() => {
    if (!selectedRw) return [];
    return voters.filter((v) => {
      if (v.rw !== selectedRw) return false;
      if (selectedRt && v.rt !== selectedRt) return false;
      return true;
    });
  }, [voters, selectedRw, selectedRt]);

  // Voters for individual tab
  const individualVoters = useMemo(() => {
    return voters.filter((v) => {
      if (tpsFilter === 'unassigned' && v.tpsId) return false;
      if (tpsFilter === 'this_tps' && v.tpsId !== tps?.id) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.namaLengkap.toLowerCase().includes(q) ||
        (v.nik && v.nik.includes(q)) ||
        v.rt.includes(q) ||
        v.rw.includes(q)
      );
    });
  }, [voters, tpsFilter, tps, searchQuery]);

  if (!isOpen || !tps) return null;

  const handleBatchTerritorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      setErrorMsg('Anda harus masuk sebagai operator atau administrator.');
      return;
    }

    if (!selectedRw) {
      setErrorMsg('Pilih RW yang ingin dialokasikan.');
      return;
    }

    if (territoryMatchedVoters.length === 0) {
      setErrorMsg('Tidak ditemukan data pemilih pada wilayah RW / RT yang dipilih.');
      return;
    }

    try {
      setIsSubmitting(true);
      const affected = StorageService.autoAssignByTerritory(
        selectedRw,
        selectedRt || undefined,
        tps.id,
        currentUser
      );

      onSuccess(
        affected,
        `Berhasil menetapkan ${affected} pemilih dari RW ${selectedRw} ${selectedRt ? `RT ${selectedRt}` : ''} ke TPS ${tps.nomor}.`
      );
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIndividualSubmit = () => {
    setErrorMsg('');
    if (!currentUser) {
      setErrorMsg('Anda harus login sebagai operator atau administrator.');
      return;
    }
    if (selectedVoterIds.length === 0) {
      setErrorMsg('Pilih minimal satu pemilih untuk dialokasikan.');
      return;
    }

    try {
      setIsSubmitting(true);
      const affected = StorageService.batchAssignVotersToTPS(
        selectedVoterIds,
        tps.id,
        currentUser
      );
      onSuccess(
        affected,
        `Berhasil menetapkan ${affected} pemilih terpilih ke TPS ${tps.nomor}.`
      );
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedVoterIds.length === individualVoters.length) {
      setSelectedVoterIds([]);
    } else {
      setSelectedVoterIds(individualVoters.map((v) => v.id));
    }
  };

  const toggleVoter = (id: string) => {
    setSelectedVoterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700/60 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Alokasi Penetapan Pemilih ke TPS {tps.nomor}
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

        {/* Tab switch */}
        <div className="px-6 pt-4 border-b border-slate-200 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('territory')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'territory'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚡ Alokasi Cepat per Wilayah (RT/RW)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'individual'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Pilih Pemilih Perorangan / Daftar
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {activeTab === 'territory' ? (
            <form onSubmit={handleBatchTerritorySubmit} className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
                Fitur ini mempermudah panitia untuk mengalokasikan seluruh pemilih yang bertempat tinggal di RW atau RT tertentu secara serentak ke TPS {tps.nomor}.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih RW <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedRw}
                    onChange={(e) => {
                      setSelectedRw(e.target.value);
                      setSelectedRt('');
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700"
                    required
                  >
                    <option value="">-- Pilih RW --</option>
                    {rws.map((r) => (
                      <option key={r.id} value={r.nomor}>
                        RW {r.nomor} ({r.nama})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih RT (Opsional - Semua RT jika kosong)
                  </label>
                  <select
                    value={selectedRt}
                    onChange={(e) => setSelectedRt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="">-- Semua RT di RW {selectedRw || '...'} --</option>
                    {filteredRts.map((r) => (
                      <option key={r.id} value={r.nomor}>
                        RT {r.nomor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedRw && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Jumlah Pemilih Terdeteksi:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {territoryMatchedVoters.length} Pemilih
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Cakupan: RW {selectedRw} {selectedRt ? `/ RT ${selectedRt}` : '(Semua RT)'} &rarr; Ditetapkan ke TPS {tps.nomor} ({tps.namaTempat})
                  </div>
                </div>
              )}

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
                  disabled={isSubmitting || !selectedRw || territoryMatchedVoters.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Memproses...' : 'Terapkan Alokasi Wilayah'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {/* Search & Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari pemilih (nama, NIK, alamat)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <select
                  value={tpsFilter}
                  onChange={(e) => setTpsFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
                >
                  <option value="unassigned">Belum Punya TPS Saja</option>
                  <option value="all">Semua Pemilih</option>
                  <option value="this_tps">Sudah di TPS {tps.nomor}</option>
                </select>
              </div>

              {/* Selection Summary */}
              <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                <span>
                  Dipilih: <strong>{selectedVoterIds.length}</strong> dari {individualVoters.length} pemilih
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="font-bold text-emerald-800 hover:text-emerald-900"
                >
                  {selectedVoterIds.length === individualVoters.length && individualVoters.length > 0
                    ? 'Batal Pilih Semua'
                    : 'Pilih Semua'}
                </button>
              </div>

              {/* Voter Selection List */}
              <div className="border border-slate-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                {individualVoters.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ada pemilih yang sesuai kriteria filter.
                  </div>
                ) : (
                  individualVoters.map((v) => {
                    const isChecked = selectedVoterIds.includes(v.id);
                    return (
                      <div
                        key={v.id}
                        onClick={() => toggleVoter(v.id)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                          isChecked ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Controlled by parent div
                            className="rounded text-emerald-700 focus:ring-emerald-700"
                          />
                          <div>
                            <div className="font-semibold text-xs text-slate-800">
                              {v.namaLengkap}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {maskNik(v.nik)} | RT {v.rt}/RW {v.rw} {v.dusunNama ? `(${v.dusunNama})` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-[11px]">
                          {v.tpsNomor ? (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                              TPS {v.tpsNomor}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                              Belum Ditetapkan
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
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
                  type="button"
                  onClick={handleIndividualSubmit}
                  disabled={isSubmitting || selectedVoterIds.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menetapkan...' : `Tetapkan ${selectedVoterIds.length} Pemilih`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
