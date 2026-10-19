import React, { useState } from 'react';
import { DesaSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Shield, User, UserCheck, Vote } from 'lucide-react';

interface LoginScreenProps {
  settings: DesaSettings;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ settings }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim()) {
      setErrorMsg('Masukkan username petugas.');
      return;
    }

    const ok = login(username.trim());
    if (!ok) {
      setErrorMsg('Akun tidak ditemukan. Gunakan "admin" atau "operator" untuk masuk.');
    }
  };

  const handleQuickLogin = (uname: string) => {
    login(uname);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up">
        {/* Header Banner */}
        <div className="bg-emerald-800 p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <Vote className="w-7 h-7 text-emerald-200" />
          </div>
          <h2 className="text-lg font-bold">Sistem Informasi DPT Pilkades</h2>
          <p className="text-xs text-emerald-200 mt-0.5">
            {settings.namaDesa}, {settings.kecamatan}
          </p>
          <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-emerald-900/60 text-[10px] font-semibold text-emerald-200 border border-emerald-700">
            Periode Pilkades: {settings.periodePilkades}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Petugas / Panitia
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin atau operator"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <span>Masuk ke Sistem DPT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Presets */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Akses Cepat (Demo / Uji Coba)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Admin Desa</span>
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Akses Penuh Wilayah</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operator')}
                className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Operator DPT</span>
                </div>
                <div className="text-[10px] text-blue-700 mt-0.5">Input & Verifikasi Warga</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>Sistem Pemutakhiran DPT Terlindungi & Terenkripsi</span>
        </div>
      </div>
    </div>
  );
};
