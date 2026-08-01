/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md bg-rose-50 border border-rose-250 text-rose-700 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl flex items-start justify-between gap-3 animate-slide-down">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <AlertCircle className="w-4 h-4 sm:w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600 animate-pulse" />
        <div className="flex flex-col">
          <span className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-rose-800">
            Peringatan Kapasitas
          </span>
          <span className="text-[10px] sm:text-[11px] text-rose-700 leading-normal mt-0.5 font-medium font-sans">
            {message}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-rose-500 hover:text-rose-700 transition-colors p-0.5 rounded-lg hover:bg-rose-100 flex-shrink-0 cursor-pointer flex items-center justify-center"
        aria-label="Tutup"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}
