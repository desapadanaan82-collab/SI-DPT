import React, { useEffect, useState } from 'react';
import { FirebaseConfigService } from '../../services/storage';
import { Cloud, Database, Key, Server, ShieldCheck, X } from 'lucide-react';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [appId, setAppId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = FirebaseConfigService.getSavedConfig();
      if (saved) {
        setApiKey(saved.apiKey || '');
        setProjectId(saved.projectId || '');
        setAppId(saved.appId || '');
      }
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    FirebaseConfigService.saveConfig({ apiKey, projectId, appId });
    setIsSaved(true);
    onConfigChanged();
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleClear = () => {
    FirebaseConfigService.clearConfig();
    setApiKey('');
    setProjectId('');
    setAppId('');
    onConfigChanged();
  };

  const isConfigured = FirebaseConfigService.isConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <Cloud className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Integrasi Cloud Firestore</h3>
              <p className="text-[11px] text-slate-500">Sinkronisasi Basis Data DPT Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
          Aplikasi DPT Pilkades saat ini berjalan dalam{' '}
          <span className="font-semibold text-emerald-800">Mode Lokal Aman & Terenkripsi</span>. Data
          disimpan langsung di peramban dan siap disinkronkan ke Google Cloud Firestore untuk
          kolaborasi antar-TPS.
        </div>

        {isSaved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Konfigurasi Firebase berhasil disimpan!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Firebase Project ID
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="pilkades-dpt-2026"
              className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Firebase API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">App ID (Opsional)</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="1:123456789:web:abcdef"
              className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {isConfigured ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium"
              >
                Putuskan Koneksi
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
