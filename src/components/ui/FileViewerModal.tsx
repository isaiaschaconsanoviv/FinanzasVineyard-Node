import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface FileViewerModalProps {
  isOpen: boolean;
  fileUrl: string | null;
  onClose: () => void;
}

export function FileViewerModal({ isOpen, fileUrl, onClose }: FileViewerModalProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted || !fileUrl) return null;

  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
  const secureUrl = `/api/tickets/secure?url=${encodeURIComponent(fileUrl)}`;

  return createPortal(
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '2rem'
      }}
    >
      <div 
        className="animate-scale-in"
        onClick={(e) => e.stopPropagation()} 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isPdf ? '1000px' : 'max-content',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-2rem',
            right: isPdf ? '0' : '-2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            borderRadius: '50%',
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <X size={20} />
        </button>

        {isPdf ? (
          <iframe 
            src={secureUrl} 
            style={{ width: '100%', height: '80vh', border: 'none', borderRadius: '8px', backgroundColor: 'white' }}
            title="Visor de PDF"
          />
        ) : (
          <img 
            src={secureUrl} 
            alt="Ticket / Comprobante" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '90vh', 
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }} 
          />
        )}
      </div>
    </div>,
    document.body
  );
}
