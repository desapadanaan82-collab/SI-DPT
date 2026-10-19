import React from 'react';
import { ToastMessage } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 text-white border-slate-700';
        let Icon = Info;

        if (toast.type === 'success') {
          bg = 'bg-emerald-800 text-white border-emerald-700';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-700 text-white border-rose-600';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-600 text-white border-amber-500';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start gap-2.5 text-xs animate-slide-up ${bg}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-white/70 hover:text-white rounded-md hover:bg-white/10 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
