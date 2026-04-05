import React, { PropsWithChildren } from 'react';

export const LacButton = ({ children, onClick }: PropsWithChildren<{ onClick?: () => void }>) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#FF6B35',
        color: '#fff',
        border: 'none',
        borderRadius: 14,
        padding: '10px 16px',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
};

export const LacCard = ({ children }: PropsWithChildren) => {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #EFE8DF',
        borderRadius: 18,
        padding: 16,
      }}
    >
      {children}
    </div>
  );
};
