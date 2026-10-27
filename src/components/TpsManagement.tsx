import React, { useMemo, useState } from 'react';
import { Dusun, RT, RW, TPS, TpsStatus, Voter } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { TpsMap } from './TpsMap';
import { AddTpsModal } from './modals/AddTpsModal';
import { EditTpsModal } from './modals/EditTpsModal';
import { TpsDetailModal } from './modals/TpsDetailModal';
import { AssignVoterTpsModal } from './modals/AssignVoterTpsModal';
import { ConfirmDialog } from './modals/ConfirmDialog';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  ExternalLink,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';

interface TpsManagementProps {
  tpsList: TPS[];
  voters: Voter[];
  dusuns: Dusun[];
  rws: RW[];
  rts: RT[];
  onRefresh: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  onNavigateToRecap?: () => void;
}

export const TpsManagement: React.FC<TpsManagementProps> = ({
  tpsList,
  voters,
  dusuns,
  rws,
  rts,
  onRefresh,
  onShowToast,
  onNavigateToRecap,
}) => {
  const { currentUser, isAdmin } = useAuth();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTps, setEditingTps] = useState<TPS | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewingTps, setViewingTps] = useState<TPS | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [assigningTps, setAssigningTps] = useState<TPS | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Deletion state
  const [deletingTps, setDeletingTps] = useState<TPS | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // Selected TPS on map
  const [selectedTpsId, setSelectedTpsId] = useState<string | undefined>(
    tpsList[0]?.id
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TpsStatus>('all');
  const [dusunFilter, setDusunFilter] = useState<string>('all');

  // Filtered TPS
  const filteredTps = useMemo(() => {
    return tpsList.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (dusunFilter !== 'all' && t.dusunId !== dusunFilter) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        t.nomor.toLowerCase().includes(q) ||
        t.nama.toLowerCase().includes(q) ||
        t.namaTempat.toLowerCase().includes(q) ||
        t.alamat.toLowerCase().includes(q) ||
        (t.dusunNama && t.dusunNama.toLowerCase().includes(q))
      );
    });
  }, [tpsList, statusFilter, dusunFilter, searchQuery]);

  // Overall Statistics
  const overallStats = useMemo(() => {
    const totalTps = tpsList.length;
    const totalVotersAssigned = voters.filter((v) => !!v.tpsId).length;
    const unassignedVoters = voters.length - totalVotersAssigned;
    const totalCapacity = tpsList.reduce((acc, t) => acc + (t.kapasitas || 300), 0);

    return {
      totalTps,
      totalVotersAssigned,
      unassignedVoters,
      totalCapacity,
      totalDpt: voters.length,
    };
  }, [tpsList, voters]);

  // Handle TPS Selection from list or map
  const handleSelectTps = (tps: TPS) => {
    setSelectedTpsId(tps.id);
  };

  // Safe delete handler
  const handleRequestDelete = (tps: TPS) => {
    const check = StorageService.canDeleteTPS(tps.id);
    if (!check.canDelete) {
      setDeleteErrorMsg(check.reason);
      setDeletingTps(tps);
      return;
    }
    setDeleteErrorMsg(null);
    setDeletingTps(tps);
  };

  const handleConfirmDelete = () => {
    if (!deletingTps || !currentUser) return;
    try {
      StorageService.deleteTPS(deletingTps.id, currentUser);
      onShowToast(`TPS ${deletingTps.nomor} ("${deletingTps.nama}") berhasil dihapus.`, 'info');
      onRefresh();
      setDeletingTps(null);
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-800 text-white rounded-xl shadow-xs">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Data & Pemetaan Lokasi TPS
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pengelolaan Titik Koordinat, Wilayah Layanan, dan Fasilitas Tempat Pemungutan Suara
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToRecap && (
            <button
              type="button"
              onClick={onNavigateToRecap}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Rekapitulasi Gender</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah TPS Baru</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total TPS Ditetapkan
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{overallStats.totalTps}</span>
            <span className="text-xs text-emerald-800 font-semibold">Titik Lokasi</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Siap melayani DPT desa</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Pemilih Dialokasikan
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-800">
              {overallStats.totalVotersAssigned}
            </span>
            <span className="text-xs text-slate-500">/ {overallStats.totalDpt} DPT</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {Math.round((overallStats.totalVotersAssigned / (overallStats.totalDpt || 1)) * 100)}% teralokasi
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Belum Memiliki TPS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-black ${
                overallStats.unassignedVoters > 0 ? 'text-amber-600' : 'text-emerald-700'
              }`}
            >
              {overallStats.unassignedVoters}
            </span>
            <span className="text-xs text-slate-500">Pemilih</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {overallStats.unassignedVoters > 0 ? 'Perlu penetapan TPS segera' : 'Semua telah teralokasi'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Kuota Kapasitas
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{overallStats.totalCapacity}</span>
            <span className="text-xs text-slate-500">Maksimal</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Rata-rata 300 pemilih / TPS</span>
        </div>
      </div>

      {/* Interactive Map Container */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-sm text-slate-800">Peta Interaktif Sebaran TPS Desa</h3>
          </div>
          <span className="text-xs text-slate-500">
            Klik penanda pada peta untuk melihat detail TPS dan rute Google Maps
          </span>
        </div>

        <TpsMap
          tpsList={filteredTps}
          selectedTpsId={selectedTpsId}
          onSelectTps={handleSelectTps}
          height="400px"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari TPS berdasarkan nomor, nama, lokasi, alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="ditetapkan">Ditetapkan</option>
            <option value="usulan">Usulan</option>
            <option value="rancangan">Rancangan</option>
          </select>
        </div>
      </div>

      {/* TPS Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTps.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
            <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">Tidak ditemukan data TPS sesuai pencarian atau filter.</p>
          </div>
        ) : (
          filteredTps.map((tps) => {
            const assigned = voters.filter((v) => v.tpsId === tps.id);
            const maleCount = assigned.filter((v) => v.jenisKelamin === 'L').length;
            const femaleCount = assigned.filter((v) => v.jenisKelamin === 'P').length;
            const isSelected = tps.id === selectedTpsId;
            const googleMapsUrl = `https://www.google.com/maps?q=${tps.latitude},${tps.longitude}`;
            const capacity = tps.kapasitas || 300;
            const percentage = Math.min(100, Math.round((assigned.length / capacity) * 100));

            return (
              <div
                key={tps.id}
                onClick={() => setSelectedTpsId(tps.id)}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  {/* Top card banner */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center">
                        {tps.nomor}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {tps.nama}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {tps.namaTempat || tps.alamat}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tps.status === 'ditetapkan'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : tps.status === 'usulan'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tps.status === 'ditetapkan' ? 'Ditetapkan' : tps.status === 'usulan' ? 'Usulan' : 'Rancangan'}
                    </span>
                  </div>

                  {/* Territory & Address */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">Cakupan Wilayah:</span>
                      <span className="font-bold text-slate-800">
                        {tps.dusunNama || 'Semua Dusun'} (RW {tps.rw || '-'} / RT {tps.rt || '-'})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate" title={tps.alamat}>
                      📍 {tps.alamat || 'Belum ada alamat spesifik'}
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium truncate" title={tps.aksesibilitas}>
                      ♿ {tps.aksesibilitas || 'Akses umum'}
                    </div>
                  </div>

                  {/* Voter Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        {assigned.length} Pemilih Terdaftar
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Kuota: {capacity} ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentage > 90 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Laki-Laki: <strong className="text-blue-700">{maleCount}</strong></span>
                      <span>Perempuan: <strong className="text-purple-700">{femaleCount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                    title="Buka rute di Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssigningTps(tps);
                        setIsAssignOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition"
                    >
                      Alokasi
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingTps(tps);
                        setIsViewOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTps(tps);
                        setIsEditOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title="Edit TPS"
                    >
                      ✏️
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestDelete(tps);
                        }}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus TPS"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <AddTpsModal
        isOpen={isAddOpen}
        dusuns={dusuns}
        rws={rws}
        rts={rts}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(_, msg) => {
          onShowToast(msg);
          onRefresh();
        }}
      />

      <EditTpsModal
        isOpen={isEditOpen}
        tps={editingTps}
        dusuns={dusuns}
        rws={rws}
        rts={rts}
        onClose={() => {
          setIsEditOpen(false);
          setEditingTps(null);
        }}
        onSuccess={(_, msg) => {
          onShowToast(msg);
          onRefresh();
        }}
      />

      <TpsDetailModal
        isOpen={isViewOpen}
        tps={viewingTps}
        voters={voters}
        onClose={() => {
          setIsViewOpen(false);
          setViewingTps(null);
        }}
        onEdit={(tps) => {
          setEditingTps(tps);
          setIsEditOpen(true);
        }}
        onOpenAssign={(tps) => {
          setAssigningTps(tps);
          setIsAssignOpen(true);
        }}
      />

      <AssignVoterTpsModal
        isOpen={isAssignOpen}
        tps={assigningTps}
        allTps={tpsList}
        voters={voters}
        rws={rws}
        rts={rts}
        onClose={() => {
          setIsAssignOpen(false);
          setAssigningTps(null);
        }}
        onSuccess={(_, msg) => {
          onShowToast(msg);
          onRefresh();
        }}
      />

      {/* Safe Deletion Modal */}
      {deletingTps && (
        <ConfirmDialog
          isOpen={true}
          title={`Konfirmasi Hapus TPS ${deletingTps.nomor}`}
          message={
            deleteErrorMsg
              ? deleteErrorMsg
              : `Apakah Anda yakin ingin menghapus TPS ${deletingTps.nomor} ("${deletingTps.nama}")? Data ini aman dihapus karena saat ini tidak ada pemilih yang terhubung.`
          }
          confirmLabel={deleteErrorMsg ? 'Tutup' : 'Hapus TPS'}
          cancelLabel="Batal"
          isDestructive={!deleteErrorMsg}
          onConfirm={() => {
            if (deleteErrorMsg) {
              setDeletingTps(null);
              setDeleteErrorMsg(null);
            } else {
              handleConfirmDelete();
            }
          }}
          onCancel={() => {
            setDeletingTps(null);
            setDeleteErrorMsg(null);
          }}
        />
      )}
    </div>
  );
};
