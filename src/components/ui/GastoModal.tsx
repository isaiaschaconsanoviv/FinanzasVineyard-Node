import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Select } from './Select';
import { Trash2, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';

interface GastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fechaPredefinida: Date;
  entradaId?: string;
  gastoToEdit?: any;
}

export function GastoModal({ isOpen, onClose, fechaPredefinida, entradaId, gastoToEdit }: GastoModalProps) {
  const [cuenta, setCuenta] = useState('Ingreso');
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [pagado, setPagado] = useState(true);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [existingComprobantes, setExistingComprobantes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customAccounts, setCustomAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/cuentas')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomAccounts(data.filter((c: any) => c.activa));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (gastoToEdit) {
        setCuenta(gastoToEdit.cuenta);
        setConcepto(gastoToEdit.concepto);
        setImporte(gastoToEdit.importe.toString());
        setPagado(gastoToEdit.pagado ?? true);
        const existing = gastoToEdit.comprobantes || [];
        setExistingComprobantes(existing);
        setFilesToUpload([]);
      } else {
        setCuenta('Ingreso');
        setConcepto('');
        setImporte('');
        setPagado(true);
        setExistingComprobantes([]);
        setFilesToUpload([]);
      }
      setError('');
      setSuccess(false);
    }
  }, [isOpen, gastoToEdit]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const isEditing = !!gastoToEdit;
      const url = isEditing ? `/api/gastos/${gastoToEdit.id}` : '/api/gastos';
      const method = isEditing ? 'PATCH' : 'POST';

      let finalComprobantes = [...existingComprobantes];

      if (filesToUpload.length > 0) {
        const uploadData = new FormData();
        filesToUpload.forEach(f => uploadData.append("files", f));
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          throw new Error("Error al subir los comprobantes");
        }
        const uploadJson = await uploadRes.json();
        if (uploadJson.urls) {
          finalComprobantes = [...finalComprobantes, ...uploadJson.urls];
        } else if (uploadJson.url) {
          finalComprobantes.push(uploadJson.url); // Fallback
        }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: fechaPredefinida.toISOString(),
          cuenta,
          concepto,
          importe: parseFloat(importe),
          pagado,
          comprobantes: finalComprobantes,
          ...(entradaId && !isEditing ? { entradaId } : {})
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar el gasto');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountOptions = [
    { value: '10% Diezmo', label: 'Diezmo (10%)' },
    { value: '3% Viña Nacional', label: 'Viña Nacional (3%)' },
    { value: 'Misiones (10%)', label: 'Misiones (10%)' },
    { value: 'Eventos (5%)', label: 'Eventos (5%)' },
    { value: 'Aguinaldo Pastor', label: 'Aguinaldo Pastor' },
    { value: 'Ingreso', label: 'Fondo General (Ingreso)' },
    ...customAccounts.map(c => ({ value: c.nombre, label: c.nombre }))
  ];

  return createPortal(
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        width: '90%', maxWidth: '400px',
        padding: '2rem',
        animation: 'slideUp 0.3s ease-out',
        position: 'relative'
      }}>
        <h2 className="text-xl font-bold mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Registrar Gasto Rápido</h2>
        
        {success ? (
          <div className="text-center py-8">
            <div className="text-success text-5xl mb-4">✓</div>
            <p className="text-lg font-medium">Gasto guardado exitosamente</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="text-danger mb-4 text-sm bg-danger/10 p-2 rounded">{error}</div>}
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">Fondo / Cuenta</label>
              <Select
                id="cuenta"
                name="cuenta"
                options={accountOptions}
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">Concepto</label>
              <input
                type="text"
                className="input-field w-full"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej. Compra de agua, Apoyo..."
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-300">Importe (MXN)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  className="input-field w-full"
                  style={{ paddingLeft: '1.75rem' }}
                  value={importe}
                  onChange={(e) => setImporte(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-300">Comprobantes</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {existingComprobantes.map((url, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <FileText size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>Comprobante guardado {idx + 1}</span>
                    </div>
                    <button type="button" onClick={() => setExistingComprobantes(prev => prev.filter((_, i) => i !== idx))} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.25rem', transition: 'all 0.2s' }} className="hover:bg-danger/20" title="Eliminar comprobante">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {filesToUpload.map((f, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed var(--accent-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <ImageIcon size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span className="text-sm truncate" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{f.name}</span>
                    </div>
                    <button type="button" onClick={() => setFilesToUpload(prev => prev.filter((_, i) => i !== idx))} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.25rem', transition: 'all 0.2s' }} className="hover:bg-danger/20" title="Quitar archivo">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const selectedFiles = Array.from(e.target.files);
                    setFilesToUpload(prev => [...prev, ...selectedFiles]);
                  }
                }}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" className="btn btn-secondary w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderStyle: 'dashed', cursor: 'pointer' }}>
                <UploadCloud size={18} />
                <span>Seleccionar Archivos</span>
              </label>
            </div>

            <div className="mb-6" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <input
                type="checkbox"
                id="pagado"
                checked={pagado}
                onChange={(e) => setPagado(e.target.checked)}
                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="pagado" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                <span className="font-medium" style={{ color: pagado ? 'var(--success)' : 'var(--warning)' }}>
                  {pagado ? 'Gasto Pagado' : 'Pendiente por Pagar'}
                </span>
                <span className="text-xs text-gray-400">
                  {pagado ? 'El dinero ya fue entregado/transferido.' : 'Aún se debe este importe.'}
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
