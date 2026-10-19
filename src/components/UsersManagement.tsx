import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  Plus,
  Shield,
  ShieldAlert,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';

interface UsersManagementProps {
  onRefresh: () => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ onRefresh }) => {
  const { currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState(() => StorageService.getUsers());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [role, setRole] = useState<'admin' | 'operator'>('operator');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Akses Ditolak</h3>
        <p className="text-xs text-slate-500 mt-1">
          Halaman manajemen pengguna hanya dapat diakses oleh Administrator.
        </p>
      </div>
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg('');

    if (!username.trim() || !nama.trim()) {
      setErrorMsg('Username dan nama lengkap wajib diisi');
      return;
    }

    const cleanUsername = username.toLowerCase().trim();
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setErrorMsg(`Username "${cleanUsername}" sudah digunakan.`);
      return;
    }

    try {
      StorageService.addUser(
        {
          username: cleanUsername,
          nama: nama.trim(),
          role,
        },
        currentUser
      );

      setUsername('');
      setNama('');
      setRole('operator');
      setIsAddOpen(false);
      setUsers(StorageService.getUsers());
      onRefresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  const handleToggleUser = (id: string) => {
    if (currentUser?.id === id) {
      alert('Anda tidak dapat menonaktifkan akun yang sedang aktif digunakan.');
      return;
    }
    StorageService.toggleUserActive(id);
    setUsers(StorageService.getUsers());
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-emerald-800" />
            <span>Manajemen Pengguna & Hak Akses</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur akun Administrator Desa dan Operator KPPS / DPT untuk pemutakhiran data warga.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Role explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Peran: Administrator Desa</span>
          </div>
          <p className="text-emerald-800 leading-relaxed text-[11px]">
            Memiliki wewenang penuh mengelola wilayah RT/RW dan Dusun, identitas desa, backup
            restore data, menghapus catatan pemilih, dan manajemen pengguna.
          </p>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <UserCheck className="w-4 h-4 text-blue-700" />
            <span>Peran: Operator KPPS / DPT</span>
          </div>
          <p className="text-blue-800 leading-relaxed text-[11px]">
            Dapat mencatat warga baru, menelusuri pemilih, mengubah data, memverifikasi kesesuaian
            berkas, mengimpor berkas Excel, dan mencetak laporan DPT.
          </p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">No.</th>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Peran / Hak Akses</th>
                <th className="px-3 py-3 text-center">Status Akun</th>
                <th className="px-4 py-3">Dibuat Pada</th>
                <th className="px-4 py-3 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{u.nama}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{u.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {u.role === 'admin' ? 'Administrator' : 'Operator'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.id !== currentUser?.id ? (
                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                          u.isActive
                            ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sedang Digunakan</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Tambah Pengguna Baru</h3>
            {errorMsg && (
              <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs">{errorMsg}</div>
            )}
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="misal: kpps_rt01"
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Petugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="misal: Achmad Subagyo"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peran / Hak Akses <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                >
                  <option value="operator">Operator (Input, Edit & Verifikasi Data)</option>
                  <option value="admin">Administrator (Akses Penuh Kelola Wilayah & Sistem)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
