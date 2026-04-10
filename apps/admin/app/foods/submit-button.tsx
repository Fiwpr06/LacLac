'use client';

import { useFormStatus } from 'react-dom';
import React from 'react';

type SubmitButtonProps = {
  label: string;
  variant?: 'primary' | 'danger';
  className?: string;
};

export default function SubmitButton({ label, variant = 'primary', className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className={
          className ||
          (variant === 'primary'
            ? 'rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:col-span-2 disabled:bg-slate-400'
            : 'rounded border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50')
        }
      >
        {pending ? 'Đang xử lý...' : label}
      </button>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="h-10 w-10 animate-spin text-slate-900"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-sm font-bold text-slate-800">
              Đang tải data từ ảnh/video lên máy chủ, vui lòng đợi...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
