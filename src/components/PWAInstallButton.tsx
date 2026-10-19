import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Laptop } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'sidebar' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed PWA (standalone), suppress prompt
  if (isInstalled) {
    return null;
  }

  // Trigger install prompt if browser supports it, otherwise open instructions
  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'sidebar' && (
        <div className="p-3 mx-3 my-2 rounded-xl bg-gradient-to-br from-emerald-900/60 to-slate-900 border border-emerald-600/30 text-white shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-emerald-700/80 flex items-center justify-center text-white shrink-0">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div className="font-bold text-xs">Pasang Aplikasi SI-DPT</div>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight mb-2.5">
            Install di layar utama HP atau Laptop untuk akses cepat tanpa address bar browser.
          </p>
          <button
            onClick={handleAction}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstallable ? 'Install Sekarang' : 'Pasang di HP/PC'}</span>
          </button>
        </div>
      )}

      {variant === 'navbar' && (
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
          title="Pasang aplikasi di layar utama HP / Laptop (PWA)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install Aplikasi</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Pasang di iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="text-xs text-slate-600 space-y-2.5 pl-1 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>Buka aplikasi ini menggunakan browser <strong>Safari</strong> di iOS.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>Tekan tombol <strong>Bagikan (Share)</strong> berbentuk ikon kotak dengan panah atas di bilah bawah Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>Gulir ke bawah dan pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  4
                </span>
                <span>Tekan <strong>Tambah (Add)</strong> di pojok kanan atas.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-2 text-xs font-semibold text-white shadow-xs"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Generic Browser Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Cara Pasang Aplikasi (PWA)</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Aplikasi SI-DPT Pilkades mendukung PWA (Progressive Web App). Anda dapat meng-installnya di HP Android, Windows, Mac, atau Linux:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Chrome / Edge di Komputer:
                </div>
                <p className="text-[11px] text-slate-500 pl-5">
                  Klik ikon install (komputer kecil dengan panah ke bawah) di ujung kanan address bar browser.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Chrome di Android:
                </div>
                <p className="text-[11px] text-slate-500 pl-5">
                  Klik menu titik tiga (⋮) di pojok kanan atas, lalu pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-2 text-xs font-semibold text-white shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
