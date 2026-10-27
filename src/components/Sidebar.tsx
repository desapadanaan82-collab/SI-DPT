import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Archive,
  BarChart3,
  Building,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  History,
  LayoutDashboard,
  MapPin,
  Settings,
  Shield,
  UserCheck,
  UserCog,
  Users,
  Vote,
  X,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  currentPage: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { isAdmin, currentUser } = useAuth();

  const handleNav = (id: string) => {
    onNavigate(id);
    onClose();
  };

  const navGroups = [
    {
      title: 'Menu Utama',
      items: [
        { id: 'dashboard', label: 'Dashboard Statistik', icon: LayoutDashboard },
        { id: 'voters', label: 'Data DPT Warga', icon: Users },
        { id: 'verification', label: 'Verifikasi Data', icon: UserCheck },
        { id: 'tps', label: 'Data & Peta TPS', icon: MapPin },
        { id: 'tps_recap', label: 'Rekapitulasi Gender', icon: BarChart3 },
        { id: 'territories', label: 'Data Wilayah RT/RW', icon: Building },
      ],
    },
    {
      title: 'Berkas & Pelaporan',
      items: [
        { id: 'import', label: 'Impor Excel / CSV', icon: FileSpreadsheet },
        { id: 'reports', label: 'Laporan & Ekspor', icon: FileText },
      ],
    },
    {
      title: 'Portal Warga',
      items: [
        { id: 'public_preview', label: 'Lihat Portal Publik', icon: Vote },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: 'Administrasi & Keamanan',
            items: [
              { id: 'users', label: 'Manajemen Pengguna', icon: UserCog },
              { id: 'settings', label: 'Identitas & Kop Desa', icon: Settings },
              { id: 'logs', label: 'Log Aktivitas (Audit)', icon: History },
              { id: 'backup', label: 'Cadangan & Pemulihan', icon: Archive },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-emerald-700 text-white flex items-center justify-center font-bold">
              <Vote className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-xs">Pilkades DPT</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav lists */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-emerald-300' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* PWA Install Promotion in Sidebar */}
        <PWAInstallButton variant="sidebar" />

        {/* User footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                currentUser?.role === 'admin' ? 'bg-emerald-700' : 'bg-blue-700'
              }`}
            >
              {currentUser?.nama.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <div className="font-semibold text-white text-xs truncate">
                {currentUser?.nama || 'Petugas'}
              </div>
              <div className="text-[10px] text-emerald-400 capitalize">
                Hak Akses: {currentUser?.role === 'admin' ? 'Administrator' : 'Operator DPT'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
