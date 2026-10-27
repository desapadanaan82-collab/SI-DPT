import React, { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StorageService } from './services/storage';
import { Dusun, RT, RW, ToastMessage, TPS, Voter } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { VotersList } from './components/VotersList';
import { Verification } from './components/Verification';
import { Territories } from './components/Territories';
import { TpsManagement } from './components/TpsManagement';
import { TpsRecap } from './components/TpsRecap';
import { PublicPortal } from './components/PublicPortal';
import { ImportData } from './components/ImportData';
import { Reports } from './components/Reports';
import { UsersManagement } from './components/UsersManagement';
import { Settings } from './components/Settings';
import { AuditLogs } from './components/AuditLogs';
import { BackupRestore } from './components/BackupRestore';
import { LoginScreen } from './components/LoginScreen';
import { AddVoterModal } from './components/modals/AddVoterModal';
import { EditVoterModal } from './components/modals/EditVoterModal';
import { VoterDetailModal } from './components/modals/VoterDetailModal';
import { VerifyVoterModal } from './components/modals/VerifyVoterModal';
import { ConfirmDialog } from './components/modals/ConfirmDialog';
import { FirebaseModal } from './components/modals/FirebaseModal';
import { HelpModal } from './components/modals/HelpModal';
import { Toast } from './components/Toast';

function MainApp() {
  const { currentUser, isAdmin } = useAuth();

  // Primary data states
  const [voters, setVoters] = useState<Voter[]>(() => StorageService.getVoters());
  const [dusuns, setDusuns] = useState<Dusun[]>(() => StorageService.getDusuns());
  const [rws, setRws] = useState<RW[]>(() => StorageService.getRWs());
  const [rts, setRts] = useState<RT[]>(() => StorageService.getRTs());
  const [tpsList, setTpsList] = useState<TPS[]>(() => StorageService.getTPS());
  const [settings, setSettings] = useState(() => StorageService.getSettings());

  // Routing and UI states
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast dispatchers
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Global refresh
  const refreshData = useCallback(() => {
    setVoters(StorageService.getVoters());
    setDusuns(StorageService.getDusuns());
    setRws(StorageService.getRWs());
    setRts(StorageService.getRTs());
    setTpsList(StorageService.getTPS());
    setSettings(StorageService.getSettings());
  }, []);

  // Reactive storage subscriber
  useEffect(() => {
    const unsubscribe = StorageService.subscribeToStorage(refreshData);
    return () => unsubscribe();
  }, [refreshData]);

  // Modals for voter operations
  const [isAddVoterOpen, setIsAddVoterOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [isEditVoterOpen, setIsEditVoterOpen] = useState(false);
  const [verifyingVoter, setVerifyingVoter] = useState<Voter | null>(null);
  const [isVerifyVoterOpen, setIsVerifyVoterOpen] = useState(false);
  const [viewingVoter, setViewingVoter] = useState<Voter | null>(null);
  const [isViewVoterOpen, setIsViewVoterOpen] = useState(false);
  const [deletingVoter, setDeletingVoter] = useState<Voter | null>(null);
  const [isDeleteVoterOpen, setIsDeleteVoterOpen] = useState(false);

  // System modals
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleOpenAddVoter = () => {
    setIsAddVoterOpen(true);
  };

  const handleOpenEditVoter = (voter: Voter) => {
    setEditingVoter(voter);
    setIsEditVoterOpen(true);
  };

  const handleOpenVerifyVoter = (voter: Voter) => {
    setVerifyingVoter(voter);
    setIsVerifyVoterOpen(true);
  };

  const handleOpenViewVoter = (voter: Voter) => {
    setViewingVoter(voter);
    setIsViewVoterOpen(true);
  };

  const handleOpenDeleteVoter = (voter: Voter) => {
    setDeletingVoter(voter);
    setIsDeleteVoterOpen(true);
  };

  const handleConfirmDeleteVoter = () => {
    if (deletingVoter && currentUser) {
      const ok = StorageService.deleteVoter(deletingVoter.id, currentUser);
      if (ok) {
        showToast(`Data pemilih "${deletingVoter.namaLengkap}" berhasil dihapus.`, 'info');
        refreshData();
      }
      setIsDeleteVoterOpen(false);
      setDeletingVoter(null);
    }
  };

  // Public visitor portal view if not logged in
  if (!currentUser) {
    if (showLoginModal) {
      return (
        <LoginScreen
          settings={settings}
          onCancel={() => setShowLoginModal(false)}
        />
      );
    }
    return (
      <PublicPortal
        settings={settings}
        tpsList={tpsList}
        voters={voters}
        dusuns={dusuns}
        onOpenLogin={() => setShowLoginModal(true)}
      />
    );
  }

  // Public preview mode for staff
  if (currentPage === 'public_preview') {
    return (
      <div className="relative">
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span>👁️ Mode Pratinjau Portal Publik (Tampilan Warga Desa)</span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="px-3 py-1 bg-white text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-50 transition"
          >
            &larr; Kembali ke Panel Petugas
          </button>
        </div>
        <PublicPortal
          settings={settings}
          tpsList={tpsList}
          voters={voters}
          dusuns={dusuns}
          onOpenLogin={() => setCurrentPage('dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenFirebaseModal={() => setIsFirebaseOpen(true)}
        onOpenPrivacyModal={() => setIsHelpOpen(true)}
        onNavigate={setCurrentPage}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={setCurrentPage}
        />

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && (
              <Dashboard
                voters={voters}
                dusuns={dusuns}
                rws={rws}
                rts={rts}
                tpsList={tpsList}
                settings={settings}
                onNavigate={setCurrentPage}
                onAddVoter={handleOpenAddVoter}
                onSelectVoter={handleOpenViewVoter}
              />
            )}

            {currentPage === 'voters' && (
              <VotersList
                voters={voters}
                dusuns={dusuns}
                rws={rws}
                rts={rts}
                tpsList={tpsList}
                settings={settings}
                onAddVoter={handleOpenAddVoter}
                onEditVoter={handleOpenEditVoter}
                onDeleteVoter={handleOpenDeleteVoter}
                onVerifyVoter={handleOpenVerifyVoter}
                onViewVoter={handleOpenViewVoter}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'tps' && (
              <TpsManagement
                tpsList={tpsList}
                voters={voters}
                dusuns={dusuns}
                rws={rws}
                rts={rts}
                onRefresh={refreshData}
                onShowToast={showToast}
                onNavigateToRecap={() => setCurrentPage('tps_recap')}
              />
            )}

            {currentPage === 'tps_recap' && (
              <TpsRecap
                tpsList={tpsList}
                voters={voters}
                dusuns={dusuns}
                rws={rws}
                rts={rts}
                settings={settings}
                onSelectTps={(t) => setCurrentPage('tps')}
              />
            )}

            {currentPage === 'verification' && (
              <Verification
                voters={voters}
                dusuns={dusuns}
                rws={rws}
                settings={settings}
                onVerifyVoter={handleOpenVerifyVoter}
                onViewVoter={handleOpenViewVoter}
              />
            )}

            {currentPage === 'territories' && (
              <Territories
                dusuns={dusuns}
                rws={rws}
                rts={rts}
                voters={voters}
                onFilterVotersByTerritory={(rw, rt) => {
                  setCurrentPage('voters');
                }}
                onRefresh={refreshData}
                onShowToast={showToast}
              />
            )}

            {currentPage === 'import' && (
              <ImportData
                onSuccessImport={(count) => {
                  showToast(
                    `Berhasil mengimpor ${count} data pemilih ke dalam Daftar Pemilih Tetap (DPT)!`
                  );
                  refreshData();
                }}
              />
            )}

            {currentPage === 'reports' && (
              <Reports voters={voters} rws={rws} rts={rts} settings={settings} />
            )}

            {currentPage === 'users' && <UsersManagement onRefresh={refreshData} />}

            {currentPage === 'settings' && (
              <Settings
                settings={settings}
                onUpdateSettings={(updated) => {
                  setSettings(updated);
                  showToast('Pengaturan desa dan kepanitiaan berhasil diperbarui.');
                }}
              />
            )}

            {currentPage === 'logs' && <AuditLogs />}

            {currentPage === 'backup' && <BackupRestore onRefreshAll={refreshData} />}
          </div>
        </main>
      </div>

      {/* Voter Modals */}
      <AddVoterModal
        isOpen={isAddVoterOpen}
        dusuns={dusuns}
        rws={rws}
        rts={rts}
        settings={settings}
        onClose={() => setIsAddVoterOpen(false)}
        onSuccess={(_, msg) => {
          showToast(msg);
          refreshData();
        }}
      />

      <EditVoterModal
        isOpen={isEditVoterOpen}
        voter={editingVoter}
        dusuns={dusuns}
        rws={rws}
        rts={rts}
        settings={settings}
        onClose={() => {
          setIsEditVoterOpen(false);
          setEditingVoter(null);
        }}
        onSuccess={(_, msg) => {
          showToast(msg);
          refreshData();
        }}
      />

      <VerifyVoterModal
        isOpen={isVerifyVoterOpen}
        voter={verifyingVoter}
        settings={settings}
        onClose={() => {
          setIsVerifyVoterOpen(false);
          setVerifyingVoter(null);
        }}
        onSuccess={(_, msg) => {
          showToast(msg);
          refreshData();
        }}
      />

      <VoterDetailModal
        isOpen={isViewVoterOpen}
        voter={viewingVoter}
        settings={settings}
        onClose={() => {
          setIsViewVoterOpen(false);
          setViewingVoter(null);
        }}
        onEdit={(v) => {
          setIsViewVoterOpen(false);
          handleOpenEditVoter(v);
        }}
        onVerify={(v) => {
          setIsViewVoterOpen(false);
          handleOpenVerifyVoter(v);
        }}
        onDelete={(v) => {
          setIsViewVoterOpen(false);
          handleOpenDeleteVoter(v);
        }}
      />

      <ConfirmDialog
        isOpen={isDeleteVoterOpen}
        title="Konfirmasi Hapus Data Pemilih"
        message={`Apakah Anda yakin ingin menghapus data warga "${deletingVoter?.namaLengkap}" dari Daftar Pemilih Tetap (RT ${deletingVoter?.rt} / RW ${deletingVoter?.rw})? Tindakan ini akan dicatat di log audit.`}
        confirmLabel="Hapus Data"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDeleteVoter}
        onCancel={() => {
          setIsDeleteVoterOpen(false);
          setDeletingVoter(null);
        }}
      />

      {/* Other System Modals */}
      <FirebaseModal
        isOpen={isFirebaseOpen}
        onClose={() => setIsFirebaseOpen(false)}
        onConfigChanged={refreshData}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
