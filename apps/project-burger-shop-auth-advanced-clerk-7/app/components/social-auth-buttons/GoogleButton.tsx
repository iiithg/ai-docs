"use client";
import React from 'react';

type Props = {
  onClick?: () => void;
  disabled?: boolean;
};

export default function GoogleButton({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded bg-white border px-3 py-2 hover:bg-neutral-50 disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <span>🔐</span>
      <span>Sign in with Google</span>
    </button>
  );
}

