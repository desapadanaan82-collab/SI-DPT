import React, { useState } from 'react';
import { DesaSettings, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { FirebaseConfigService, StorageService } from '../services/storage';
import {
  Cloud,
  Database,
  HelpCircle,
  LogOut,
  Menu,
  Shield,
  UserCheck,
  UserCog,
  Users,
  Vote,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  settings: DesaSettings;
  onToggleSidebar: () => void;
  onOpenFirebaseModal: () => void;
  onOpenPrivacyModal: () => void;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onToggleSidebar,
  onOpenFirebaseModal,
  onOpenPrivacyModal,
  onNavigate,
}) => {
  const { currentUser, logout, switchUser } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const isCloudConnected = FirebaseConfigService.isConfigured();
  const allUsers = StorageService.getUsers();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
            title="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm text-slate-900 tracking-tight">
                  Sistem Informasi DPT Pilkades
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {settings.periodePilkades || '2026 - 2032'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {settings.namaDesa}, {settings.kecamatan}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Cloud Sync Status & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud / Local status badge */}
          <button
            onClick={onOpenFirebaseModal}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isCloudConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Pengaturan Integrasi Cloud Firestore"
          >
            {isCloudConnected ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">Cloud Sync Aktif</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>Mode Lokal (Aman)</span>
              </>
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Help Button */}
          <button
            onClick={onOpenPrivacyModal}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Pedoman & Bantuan Penggunaan"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Current user & dropdown switcher */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${
                    currentUser.role === 'admin' ? 'bg-emerald-800' : 'bg-blue-700'
                  }`}
                >
                  {currentUser.nama.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-slate-800 leading-tight">
                    {currentUser.nama}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">{currentUser.role}</div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-xs animate-scale-up z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800">{currentUser.nama}</p>
                    <p className="text-[10px] text-slate-500">
                      Peran:{' '}
                      <span className="font-semibold uppercase text-emerald-800">
                        {currentUser.role}
                      </span>
                    </p>
                  </div>

                  {/* Switch user */}
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Ganti Petugas / Akun
                  </div>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${
                        u.id === currentUser.id ? 'font-bold text-emerald-800 bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{u.nama}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                    </button>
                  ))}

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
