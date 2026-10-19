import React, { useMemo, useState } from 'react';
import { Dusun, RT, RW, TerritoryRelationCheck } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle,
  Building2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { TerritoryType } from './EditTerritoryModal';

interface DeleteTerritoryDialogProps {
  isOpen: boolean;
  type: TerritoryType;
  item: Dusun | RW | RT | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const DeleteTerritoryDialog: React.FC<DeleteTerritoryDialogProps> = ({
  isOpen,
  type,
  item,
  onClose,
  onSuccess,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Compute relation check safely
  const checkResult: TerritoryRelationCheck = useMemo(() => {
    if (!item) {
      return {
        canDelete: false,
        childRWCount: 0,
        childRTCount: 0,
        voterCount: 0,
        reason: 'Data wilayah tidak ditemukan.',
      };
    }

    if (type === 'dusun') {
      return StorageService.canDeleteDusun(item.id);
    } else if (type === 'rw') {
      return StorageService.canDeleteRW(item.id);
    } else {
      return StorageService.canDeleteRT(item.id);
    }
  }, [item, type, isOpen]);

  if (!isOpen || !item) return null;

  const typeName =
    type === 'dusun'
      ? 'Dusun'
      : type === 'rw'
      ? `RW ${(item as RW).nomor}`
      : `RT ${(item as RT).nomor}`;

  const handleDelete = () => {
    if (!currentUser || !isAdmin) {
      setErrorMsg('Hanya Administrator yang memiliki wewenang untuk menghapus wilayah.');
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');

    try {
      if (type === 'dusun') {
        StorageService.deleteDusun(item.id, currentUser);
        onSuccess(`Wilayah Dusun "${item.nama}" berhasil dihapus dari basis data.`);
      } else if (type === 'rw') {
        const rw = item as RW;
        StorageService.deleteRW(item.id, currentUser);
        onSuccess(`Wilayah RW ${rw.nomor} ("${rw.nama}") berhasil dihapus dari basis data.`);
      } else if (type === 'rt') {
        const rt = item as RT;
        StorageService.deleteRT(item.id, currentUser);
        onSuccess(
          `Wilayah RT ${rt.nomor} (RW ${rt.rwNomor}) berhasil dihapus dari basis data.`
        );
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                checkResult.canDelete
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {checkResult.canDelete ? (
                <Trash2 className="w-5 h-5 text-rose-600" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {checkResult.canDelete
                  ? `Konfirmasi Hapus ${typeName}`
                  : `Penghapusan ${typeName} Ditolak`}
              </h3>
              <p className="text-[11px] text-slate-500">{item.nama}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error alert if thrown */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Content based on canDelete */}
        {!checkResult.canDelete ? (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 mb-1">
                  Aturan Integritas Data Pemilih Berlaku:
                </p>
                <p>{checkResult.reason}</p>
              </div>
            </div>

            {/* Relations Summary Box */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-700">Rincian Data Terhubung:</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {type === 'dusun' && (
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" /> RW
                    </div>
                    <div className="font-bold text-sm text-slate-800">
                      {checkResult.childRWCount}
                    </div>
                  </div>
                )}
                {(type === 'dusun' || type === 'rw') && (
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> RT
                    </div>
                    <div className="font-bold text-sm text-slate-800">
                      {checkResult.childRTCount}
                    </div>
                  </div>
                )}
                <div
                  className={`p-2 bg-white rounded border border-slate-200 ${
                    type === 'rt' ? 'col-span-3' : ''
                  }`}
                >
                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" /> Pemilih
                  </div>
                  <div
                    className={`font-bold text-sm ${
                      checkResult.voterCount > 0 ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {checkResult.voterCount} Warga
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-1 text-center">
                Sistem tidak pernah menghapus atau memindahkan data pemilih secara otomatis.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Tutup & Kembali
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed flex items-start gap-2.5">
              <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900 mb-1">
                  Apakah Anda yakin ingin menghapus {typeName}?
                </p>
                <p className="text-rose-800">
                  Tindakan ini tidak dapat dilakukan jika masih terdapat data pemilih yang terkait.
                  Pemeriksaan sistem telah memastikan tidak ada pemilih atau sub-wilayah yang terikat.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Validasi Aman: 0 RT dan 0 data pemilih terhubung. Wilayah siap dihapus.</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
