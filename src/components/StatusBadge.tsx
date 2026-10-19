import React from 'react';
import { VerificationStatus, VoterEligibilityStatus } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, HelpCircle, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-medium';

  if (status === 'sudah_diverifikasi') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium ${sizeClasses}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Sudah Diverifikasi</span>
      </span>
    );
  }

  if (status === 'perlu_perbaikan') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 font-medium ${sizeClasses}`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>Perlu Perbaikan</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 font-medium ${sizeClasses}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <span>Belum Diverifikasi</span>
    </span>
  );
};

interface EligibilityBadgeProps {
  status?: VoterEligibilityStatus;
  size?: 'sm' | 'md';
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({
  status = 'belum_dapat_dinilai',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs font-medium';

  switch (status) {
    case 'terverifikasi':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-300 font-semibold ${sizeClasses}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Terverifikasi Sah</span>
        </span>
      );

    case 'memenuhi_syarat_usia':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-300 font-medium ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Memenuhi Syarat Usia</span>
        </span>
      );

    case 'perlu_pemeriksaan':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-medium ${sizeClasses}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Perlu Pemeriksaan Kelayakan</span>
        </span>
      );

    case 'perlu_perbaikan':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 font-medium ${sizeClasses}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Perlu Perbaikan Data</span>
        </span>
      );

    case 'belum_dapat_dinilai':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-medium ${sizeClasses}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Belum Dapat Dinilai</span>
        </span>
      );
  }
};
