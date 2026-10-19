import React, { useMemo, useState } from 'react';
import { StorageService } from '../services/storage';
import { AuditAction, AuditLog } from '../types';
import { Filter, History, Search } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedAction && log.action !== selectedAction) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          log.description.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, selectedAction, search]);

  const renderActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'tambah_warga':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Tambah Warga
          </span>
        );
      case 'edit_warga':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
            Edit Warga
          </span>
        );
      case 'hapus_warga':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
            Hapus Warga
          </span>
        );
      case 'verifikasi_warga':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
            Verifikasi
          </span>
        );
      case 'kelola_wilayah':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            Kelola Wilayah
          </span>
        );
      case 'impor_excel':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
            Impor Excel
          </span>
        );
      case 'pengaturan_desa':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
            Pengaturan
          </span>
        );
      case 'backup_restore':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
            Backup / User
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            Aktivitas
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-800" />
            <span>Log Audit & Rekam Jejak Sistem</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Seluruh penambahan, pengubahan, verifikasi, dan pengelolaan wilayah tercatat otomatis
            demi integritas dan transparansi DPT Pilkades.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari log berdasarkan nama petugas atau uraian kegiatan..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="">Semua Jenis Aksi</option>
            <option value="kelola_wilayah">Kelola Wilayah</option>
            <option value="tambah_warga">Tambah Warga</option>
            <option value="edit_warga">Edit Warga</option>
            <option value="hapus_warga">Hapus Warga</option>
            <option value="verifikasi_warga">Verifikasi Warga</option>
            <option value="impor_excel">Impor Excel</option>
            <option value="pengaturan_desa">Pengaturan Desa</option>
            <option value="backup_restore">Cadangan / Pengguna</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-3 w-40">Waktu Kejadian</th>
                <th className="px-4 py-3 w-44">Petugas</th>
                <th className="px-3.5 py-3 w-32">Kategori Aksi</th>
                <th className="px-4 py-3">Uraian / Deskripsi Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{log.userRole}</div>
                  </td>
                  <td className="px-3.5 py-3">{renderActionBadge(log.action)}</td>
                  <td className="px-4 py-3 leading-relaxed text-slate-800">{log.description}</td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada catatan log aktivitas yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
