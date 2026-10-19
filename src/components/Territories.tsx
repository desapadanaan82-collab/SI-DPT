import React, { useMemo, useState } from 'react';
import { Dusun, RT, RW, Voter } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  Building,
  Building2,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Filter,
  Layers,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Table as TableIcon,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { EditTerritoryModal, TerritoryType } from './modals/EditTerritoryModal';
import { DeleteTerritoryDialog } from './modals/DeleteTerritoryDialog';

interface TerritoriesProps {
  dusuns: Dusun[];
  rws: RW[];
  rts: RT[];
  voters: Voter[];
  onFilterVotersByTerritory: (rw?: string, rt?: string) => void;
  onRefresh: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const Territories: React.FC<TerritoriesProps> = ({
  dusuns,
  rws,
  rts,
  voters,
  onFilterVotersByTerritory,
  onRefresh,
  onShowToast,
}) => {
  const { currentUser, isAdmin } = useAuth();

  // Search & view mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDusunFilter, setSelectedDusunFilter] = useState('');
  const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('hierarchical');
  const [activeTableTab, setActiveTableTab] = useState<'dusun' | 'rw' | 'rt'>('rt');

  // Modals state for Adding
  const [isAddDusunOpen, setIsAddDusunOpen] = useState(false);
  const [newDusunNama, setNewDusunNama] = useState('');
  const [newDusunKet, setNewDusunKet] = useState('');

  const [isAddRwOpen, setIsAddRwOpen] = useState(false);
  const [newRwNomor, setNewRwNomor] = useState('');
  const [newRwNama, setNewRwNama] = useState('');
  const [newRwDusunId, setNewRwDusunId] = useState('');
  const [newRwKet, setNewRwKet] = useState('');

  const [isAddRtOpen, setIsAddRtOpen] = useState(false);
  const [newRtNomor, setNewRtNomor] = useState('');
  const [newRtRwNomor, setNewRtRwNomor] = useState('');
  const [newRtNama, setNewRtNama] = useState('');
  const [newRtKet, setNewRtKet] = useState('');

  const [formError, setFormError] = useState('');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editType, setEditType] = useState<TerritoryType>('dusun');
  const [editingItem, setEditingItem] = useState<Dusun | RW | RT | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<TerritoryType>('dusun');
  const [deletingItem, setDeletingItem] = useState<Dusun | RW | RT | null>(null);

  // Handlers for Edit
  const handleOpenEdit = (type: TerritoryType, item: Dusun | RW | RT) => {
    setEditType(type);
    setEditingItem(item);
    setEditModalOpen(true);
  };

  // Handlers for Delete
  const handleOpenDelete = (type: TerritoryType, item: Dusun | RW | RT) => {
    setDeleteType(type);
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  // Add Dusun Submit
  const handleAddDusun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError('');

    try {
      const added = StorageService.addDusun(
        { nama: newDusunNama, keterangan: newDusunKet },
        currentUser
      );
      setNewDusunNama('');
      setNewDusunKet('');
      setIsAddDusunOpen(false);
      onShowToast(`Wilayah Dusun "${added.nama}" berhasil ditambahkan.`);
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  // Add RW Submit
  const handleAddRW = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError('');

    try {
      const added = StorageService.addRW(
        {
          nomor: newRwNomor,
          nama: newRwNama,
          dusunId: newRwDusunId || (dusuns.length > 0 ? dusuns[0].id : undefined),
          keterangan: newRwKet,
        },
        currentUser
      );
      setNewRwNomor('');
      setNewRwNama('');
      setNewRwDusunId('');
      setNewRwKet('');
      setIsAddRwOpen(false);
      onShowToast(`RW ${added.nomor} ("${added.nama}") berhasil ditambahkan.`);
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  // Add RT Submit
  const handleAddRT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError('');

    try {
      const added = StorageService.addRT(
        {
          nomor: newRtNomor,
          rwNomor: newRtRwNomor,
          nama: newRtNama,
          keterangan: newRtKet,
        },
        currentUser
      );
      setNewRtNomor('');
      setNewRtRwNomor('');
      setNewRtNama('');
      setNewRtKet('');
      setIsAddRtOpen(false);
      onShowToast(`RT ${added.nomor} pada RW ${added.rwNomor} berhasil ditambahkan.`);
      onRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

  // Active status toggles
  const handleToggleDusunActive = (id: string) => {
    if (currentUser && isAdmin) {
      StorageService.toggleDusunActive(id, currentUser);
      onRefresh();
      onShowToast('Status aktif dusun diperbarui.', 'info');
    }
  };

  const handleToggleRWActive = (id: string) => {
    if (currentUser && isAdmin) {
      StorageService.toggleRWActive(id, currentUser);
      onRefresh();
      onShowToast('Status aktif RW diperbarui.', 'info');
    }
  };

  const handleToggleRTActive = (id: string) => {
    if (currentUser && isAdmin) {
      StorageService.toggleRTActive(id, currentUser);
      onRefresh();
      onShowToast('Status aktif RT diperbarui.', 'info');
    }
  };

  // Helper calculation maps
  const stats = useMemo(() => {
    const totalDusun = dusuns.length;
    const totalRW = rws.length;
    const totalRT = rts.length;
    const totalVoters = voters.length;

    return { totalDusun, totalRW, totalRT, totalVoters };
  }, [dusuns, rws, rts, voters]);

  // Filtered lists
  const filteredDusuns = useMemo(() => {
    return dusuns.filter((d) => {
      if (selectedDusunFilter && d.id !== selectedDusunFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          d.nama.toLowerCase().includes(q) ||
          d.keterangan.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dusuns, selectedDusunFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-800" />
            <span>Pengelolaan Wilayah Dusun, RW & RT</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola hierarki terstruktur tingkat Dusun, RW, dan RT dengan perlindungan relasi data pemilih.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setFormError('');
                setIsAddDusunOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-800" />
              <span>Tambah Dusun</span>
            </button>
            <button
              onClick={() => {
                setFormError('');
                setNewRwDusunId(dusuns.length > 0 ? dusuns[0].id : '');
                setIsAddRwOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-800" />
              <span>Tambah RW</span>
            </button>
            <button
              onClick={() => {
                setFormError('');
                setNewRtRwNomor(rws.length > 0 ? rws[0].nomor : '');
                setIsAddRtOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah RT</span>
            </button>
          </div>
        )}
      </div>

      {/* Relational Safety Banner */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-emerald-900">
              Perlindungan Relasi & Integritas Data Pemilih (DPT) Aktif:
            </p>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Tombol <span className="font-semibold text-emerald-950">Ubah</span> dan{' '}
              <span className="font-semibold text-emerald-950">Hapus</span> tersedia untuk seluruh
              tingkatan wilayah (Dusun, RW, RT). Perubahan nama mempertahankan ID wilayah secara
              aman, sedangkan penghapusan akan ditolak otomatis jika masih memiliki relasi data pemilih
              atau sub-wilayah.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-white/70 px-3 py-1.5 rounded-lg border border-emerald-200 text-[11px] font-semibold text-emerald-900">
          <Users className="w-4 h-4 text-emerald-700" />
          <span>{stats.totalVoters} Data Pemilih Terlindungi</span>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Total Dusun</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{stats.totalDusun}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Wilayah Bagian Desa</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Total Rukun Warga (RW)</div>
          <div className="text-xl font-bold text-emerald-800 mt-1">{stats.totalRW}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {rws.filter((r) => r.isActive).length} Aktif • {rws.filter((r) => !r.isActive).length}{' '}
            Nonaktif
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Total Rukun Tetangga (RT)</div>
          <div className="text-xl font-bold text-blue-800 mt-1">{stats.totalRT}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {rts.filter((r) => r.isActive).length} Aktif • {rts.filter((r) => !r.isActive).length}{' '}
            Nonaktif
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Pemilih Terdata</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{stats.totalVoters}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Terdaftar di DPT Desa</div>
        </div>
      </div>

      {/* Control / View Mode Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama Dusun, RW, atau RT..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
            />
          </div>

          <div className="w-48 hidden sm:block">
            <select
              value={selectedDusunFilter}
              onChange={(e) => setSelectedDusunFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="">Semua Dusun</option>
              {dusuns.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-end sm:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('hierarchical')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'hierarchical'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tampilan Hierarki Dusun & RW</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel Wilayah Lengkap</span>
          </button>
        </div>
      </div>

      {/* ================= VIEW MODE: HIERARCHICAL ================= */}
      {viewMode === 'hierarchical' ? (
        <div className="space-y-8">
          {filteredDusuns.map((dusun) => {
            // Find RWs belonging to this Dusun
            const dusunRWs = rws.filter(
              (rw) => rw.dusunId === dusun.id || rw.dusunNama === dusun.nama
            );
            const dusunRwNomors = new Set(dusunRWs.map((rw) => rw.nomor));
            const dusunRTs = rts.filter((rt) => dusunRwNomors.has(rt.rwNomor));
            const dusunVotersCount = voters.filter(
              (v) =>
                dusunRwNomors.has(v.rw) ||
                (v.alamat && v.alamat.toLowerCase().includes(dusun.nama.toLowerCase()))
            ).length;

            return (
              <div
                key={dusun.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* DUSUN HEADER CARD with Action Buttons */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-700/80 text-white flex items-center justify-center font-bold text-base shadow-inner border border-emerald-500/30 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                          {dusun.nama}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            dusun.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-700 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {dusun.isActive ? 'Dusun Aktif' : 'Dusun Nonaktif'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-slate-300">
                          {dusunRWs.length} RW • {dusunRTs.length} RT • {dusunVotersCount} Pemilih
                        </span>
                      </div>
                      {dusun.keterangan && (
                        <p className="text-xs text-slate-300 mt-1 italic">{dusun.keterangan}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions on Dusun */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEdit('dusun', dusun)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors shadow-xs"
                          title="Ubah Nama atau Keterangan Dusun"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ubah Dusun</span>
                        </button>

                        <button
                          onClick={() => handleOpenDelete('dusun', dusun)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors shadow-xs"
                          title="Hapus Dusun (Hanya jika tidak memiliki RW, RT, atau pemilih)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Dusun</span>
                        </button>

                        <button
                          onClick={() => handleToggleDusunActive(dusun.id)}
                          className="px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:bg-slate-700/50"
                        >
                          {dusun.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setFormError('');
                          setNewRwDusunId(dusun.id);
                          setIsAddRwOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah RW di Dusun Ini</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* RW Cards within Dusun */}
                <div className="p-5 space-y-6 bg-slate-50/50">
                  {dusunRWs.length > 0 ? (
                    dusunRWs.map((rw) => {
                      const rwRTs = rts.filter((rt) => rt.rwNomor === rw.nomor);
                      const rwVotersCount = voters.filter((v) => v.rw === rw.nomor).length;

                      return (
                        <div
                          key={rw.id}
                          className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                        >
                          {/* RW Header with Ubah & Hapus */}
                          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {rw.nomor}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-bold text-slate-900">{rw.nama}</h4>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      rw.isActive
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {rw.isActive ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {rwVotersCount} Pemilih
                                  </span>
                                </div>
                                {rw.keterangan && (
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    {rw.keterangan}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons for RW */}
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => onFilterVotersByTerritory(rw.nomor)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white border border-slate-300 rounded-lg hover:bg-emerald-50 transition-colors"
                              >
                                <Users className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Lihat {rwVotersCount} Warga di RW Ini</span>
                                <ChevronRight className="w-3 h-3 ml-0.5" />
                              </button>

                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => handleOpenEdit('rw', rw)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white border border-slate-300 rounded-lg hover:bg-blue-50 transition-colors"
                                    title="Ubah Nama atau Nomor RW"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Ubah RW</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenDelete('rw', rw)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-white border border-slate-300 rounded-lg hover:bg-rose-50 transition-colors"
                                    title="Hapus RW (Hanya jika tidak memiliki RT atau pemilih)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus RW</span>
                                  </button>

                                  <button
                                    onClick={() => handleToggleRWActive(rw.id)}
                                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-100"
                                  >
                                    {rw.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                  </button>
                                </>
                              )}

                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    setFormError('');
                                    setNewRtRwNomor(rw.nomor);
                                    setIsAddRtOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Tambah RT</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* RT Table / List inside RW Card */}
                          <div className="p-4">
                            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                              <span>
                                Daftar Rukun Tetangga (RT) di bawah {rw.nama} ({rwRTs.length} RT):
                              </span>
                            </div>

                            {rwRTs.length > 0 ? (
                              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                    <tr>
                                      <th className="px-3.5 py-2.5 w-16 text-center">Nomor RT</th>
                                      <th className="px-3.5 py-2.5">Nama Wilayah RT</th>
                                      <th className="px-3 py-2.5 text-center w-24">Status</th>
                                      <th className="px-3.5 py-2.5">Keterangan</th>
                                      <th className="px-3 py-2.5 text-center w-28">Jumlah Pemilih</th>
                                      <th className="px-4 py-2.5 text-center w-52">Aksi</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {rwRTs.map((rt) => {
                                      const rtVotersCount = voters.filter(
                                        (v) => v.rw === rw.nomor && v.rt === rt.nomor
                                      ).length;

                                      return (
                                        <tr
                                          key={rt.id}
                                          className="hover:bg-slate-50/80 transition-colors"
                                        >
                                          <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                                            RT {rt.nomor}
                                          </td>
                                          <td className="px-3.5 py-2.5">
                                            <div className="font-semibold text-slate-800">
                                              {rt.nama}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-mono">
                                              ID: {rt.id}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2.5 text-center">
                                            <span
                                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                rt.isActive
                                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                                              }`}
                                            >
                                              {rt.isActive ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                          </td>
                                          <td className="px-3.5 py-2.5 text-slate-500 italic text-[11px]">
                                            {rt.keterangan || '-'}
                                          </td>
                                          <td className="px-3 py-2.5 text-center font-bold text-emerald-800 font-mono">
                                            {rtVotersCount} Warga
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                              <button
                                                onClick={() =>
                                                  onFilterVotersByTerritory(rw.nomor, rt.nomor)
                                                }
                                                className="px-2 py-1 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded border border-slate-200 transition-colors"
                                                title="Filter Pemilih di RT Ini"
                                              >
                                                Filter Warga
                                              </button>

                                              {isAdmin && (
                                                <>
                                                  {/* Tombol Ubah RT */}
                                                  <button
                                                    onClick={() => handleOpenEdit('rt', rt)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded border border-slate-200 transition-colors"
                                                    title="Ubah Nama RT atau Nomor RT"
                                                  >
                                                    <Edit3 className="w-3 h-3" />
                                                    <span>Ubah</span>
                                                  </button>

                                                  {/* Tombol Hapus RT */}
                                                  <button
                                                    onClick={() => handleOpenDelete('rt', rt)}
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded border border-slate-200 transition-colors"
                                                    title="Hapus RT (Hanya jika tidak ada pemilih)"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                    <span>Hapus</span>
                                                  </button>

                                                  {/* Toggle Active RT */}
                                                  <button
                                                    onClick={() => handleToggleRTActive(rt.id)}
                                                    className="px-1.5 py-1 text-[10px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                                                    title={
                                                      rt.isActive
                                                        ? 'Nonaktifkan RT'
                                                        : 'Aktifkan RT'
                                                    }
                                                  >
                                                    {rt.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                Belum ada data RT yang ditautkan ke {rw.nama}.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                      Belum ada data RW yang ditautkan ke {dusun.nama}.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= VIEW MODE: STRUCTURED TABLES ================= */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          {/* Table Tab selector */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTableTab('dusun')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTableTab === 'dusun'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Daftar Dusun ({dusuns.length})</span>
            </button>
            <button
              onClick={() => setActiveTableTab('rw')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTableTab === 'rw'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Daftar RW ({rws.length})</span>
            </button>
            <button
              onClick={() => setActiveTableTab('rt')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTableTab === 'rt'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Daftar RT ({rts.length})</span>
            </button>
          </div>

          {/* TAB 1: DUSUN */}
          {activeTableTab === 'dusun' && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">No.</th>
                    <th className="px-4 py-3">Nama Dusun</th>
                    <th className="px-4 py-3">Keterangan</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Jumlah RW</th>
                    <th className="px-3 py-3 text-center">Jumlah RT</th>
                    <th className="px-3 py-3 text-center">Total Pemilih</th>
                    <th className="px-4 py-3 text-center w-48">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dusuns.map((dusun, idx) => {
                    const childRWs = rws.filter(
                      (r) => r.dusunId === dusun.id || r.dusunNama === dusun.nama
                    );
                    const rwNomors = new Set(childRWs.map((r) => r.nomor));
                    const childRTs = rts.filter((rt) => rwNomors.has(rt.rwNomor));
                    const voterCount = voters.filter(
                      (v) =>
                        rwNomors.has(v.rw) ||
                        (v.alamat && v.alamat.toLowerCase().includes(dusun.nama.toLowerCase()))
                    ).length;

                    return (
                      <tr key={dusun.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">{dusun.nama}</td>
                        <td className="px-4 py-3 text-slate-500 italic">{dusun.keterangan || '-'}</td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              dusun.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {dusun.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-slate-800">
                          {childRWs.length}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-slate-800">
                          {childRTs.length}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-800">
                          {voterCount} Warga
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit('dusun', dusun)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded border border-slate-200 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Ubah</span>
                                </button>
                                <button
                                  onClick={() => handleOpenDelete('dusun', dusun)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded border border-slate-200 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: RW */}
          {activeTableTab === 'rw' && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">No.</th>
                    <th className="px-4 py-3 w-20 text-center">Nomor RW</th>
                    <th className="px-4 py-3">Nama RW</th>
                    <th className="px-4 py-3">Dusun Induk</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Jumlah RT</th>
                    <th className="px-3 py-3 text-center">Total Pemilih</th>
                    <th className="px-4 py-3 text-center w-56">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rws.map((rw, idx) => {
                    const childRTs = rts.filter((rt) => rt.rwNomor === rw.nomor);
                    const voterCount = voters.filter((v) => v.rw === rw.nomor).length;
                    const dusun = dusuns.find(
                      (d) => d.id === rw.dusunId || d.nama === rw.dusunNama
                    );

                    return (
                      <tr key={rw.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                          {rw.nomor}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{rw.nama}</td>
                        <td className="px-4 py-3 text-slate-600">{dusun?.nama || '-'}</td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rw.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rw.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-slate-800">
                          {childRTs.length}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-800">
                          {voterCount} Warga
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onFilterVotersByTerritory(rw.nomor)}
                              className="px-2 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-50 rounded border border-slate-200 transition-colors"
                            >
                              Lihat Warga
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit('rw', rw)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded border border-slate-200 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Ubah</span>
                                </button>
                                <button
                                  onClick={() => handleOpenDelete('rw', rw)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded border border-slate-200 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: RT */}
          {activeTableTab === 'rt' && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">No.</th>
                    <th className="px-3.5 py-3 w-20 text-center">Nomor RT</th>
                    <th className="px-4 py-3">Nama RT</th>
                    <th className="px-3.5 py-3 text-center">RW Induk</th>
                    <th className="px-3.5 py-3">Dusun Induk</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Total Pemilih</th>
                    <th className="px-4 py-3 text-center w-56">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rts.map((rt, idx) => {
                    const voterCount = voters.filter(
                      (v) => v.rw === rt.rwNomor && v.rt === rt.nomor
                    ).length;
                    const parentRW = rws.find((r) => r.nomor === rt.rwNomor);
                    const parentDusun = dusuns.find(
                      (d) =>
                        d.id === rt.dusunId ||
                        (parentRW && (d.id === parentRW.dusunId || d.nama === parentRW.dusunNama))
                    );

                    return (
                      <tr key={rt.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                          RT {rt.nomor}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{rt.nama}</td>
                        <td className="px-3.5 py-3 text-center font-mono text-slate-700 font-medium">
                          RW {rt.rwNomor}
                        </td>
                        <td className="px-3.5 py-3 text-slate-600">{parentDusun?.nama || '-'}</td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rt.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rt.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-800">
                          {voterCount} Warga
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onFilterVotersByTerritory(rt.rwNomor, rt.nomor)}
                              className="px-2 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-50 rounded border border-slate-200 transition-colors"
                            >
                              Filter Warga
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit('rt', rt)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded border border-slate-200 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Ubah</span>
                                </button>
                                <button
                                  onClick={() => handleOpenDelete('rt', rt)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded border border-slate-200 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: TAMBAH DUSUN ================= */}
      {isAddDusunOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-800" />
                <span>Tambah Dusun Baru</span>
              </h3>
              <button
                onClick={() => setIsAddDusunOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddDusun} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Dusun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDusunNama}
                  onChange={(e) => setNewDusunNama(e.target.value)}
                  placeholder="Contoh: Dusun Krajan"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Wilayah
                </label>
                <input
                  type="text"
                  value={newDusunKet}
                  onChange={(e) => setNewDusunKet(e.target.value)}
                  placeholder="Contoh: Wilayah bagian timur desa"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDusunOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg"
                >
                  Simpan Dusun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH RW ================= */}
      {isAddRwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-800" />
                <span>Tambah Rukun Warga (RW) Baru</span>
              </h3>
              <button
                onClick={() => setIsAddRwOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddRW} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Dusun Induk <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newRwDusunId}
                  onChange={(e) => setNewRwDusunId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                  required
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor RW (teks/angka, misal: 003) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRwNomor}
                  onChange={(e) => setNewRwNomor(e.target.value)}
                  placeholder="003"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama RW
                </label>
                <input
                  type="text"
                  value={newRwNama}
                  onChange={(e) => setNewRwNama(e.target.value)}
                  placeholder="Contoh: RW 003 - Dusun Krajan"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Wilayah
                </label>
                <input
                  type="text"
                  value={newRwKet}
                  onChange={(e) => setNewRwKet(e.target.value)}
                  placeholder="Catatan tambahan"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRwOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg"
                >
                  Simpan RW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH RT ================= */}
      {isAddRtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-800" />
                <span>Tambah Rukun Tetangga (RT) Baru</span>
              </h3>
              <button
                onClick={() => setIsAddRtOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddRT} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih RW Induk <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newRtRwNomor}
                  onChange={(e) => setNewRtRwNomor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                  required
                >
                  <option value="">-- Pilih RW --</option>
                  {rws.map((rw) => (
                    <option key={rw.id} value={rw.nomor}>
                      RW {rw.nomor} - {rw.nama} {rw.dusunNama ? `(${rw.dusunNama})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor RT (misal: 004) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRtNomor}
                  onChange={(e) => setNewRtNomor(e.target.value)}
                  placeholder="004"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama RT</label>
                <input
                  type="text"
                  value={newRtNama}
                  onChange={(e) => setNewRtNama(e.target.value)}
                  placeholder="Contoh: RT 004 / RW 001"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Wilayah
                </label>
                <input
                  type="text"
                  value={newRtKet}
                  onChange={(e) => setNewRtKet(e.target.value)}
                  placeholder="Catatan tambahan"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRtOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg"
                >
                  Simpan RT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT WILAYAH (UBAR DUSUN/RW/RT) ================= */}
      <EditTerritoryModal
        isOpen={editModalOpen}
        type={editType}
        item={editingItem}
        onClose={() => {
          setEditModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={(msg) => {
          onShowToast(msg, 'success');
          onRefresh();
        }}
      />

      {/* ================= MODAL: HAPUS WILAYAH (DUSUN/RW/RT SAFETY) ================= */}
      <DeleteTerritoryDialog
        isOpen={deleteDialogOpen}
        type={deleteType}
        item={deletingItem}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingItem(null);
        }}
        onSuccess={(msg) => {
          onShowToast(msg, 'info');
          onRefresh();
        }}
      />
    </div>
  );
};
