import React, { useState, useEffect } from 'react';
import { Select } from './Select';

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
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (gastoToEdit) {
        setCuenta(gastoToEdit.cuenta);
        setConcepto(gastoToEdit.concepto);
        setImporte(gastoToEdit.importe.toString());
      } else {
        setCuenta('Ingreso');
        setConcepto('');
        setImporte('');
        setFile(null);
      }
      setError('');
      setSuccess(false);
    }
  }, [isOpen, gastoToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const isEditing = !!gastoToEdit;
      const url = isEditing ? `/api/gastos/${gastoToEdit.id}` : '/api/gastos';
      const method = isEditing ? 'PATCH' : 'POST';

      let comprobanteUrl = null;

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          throw new Error("Error al subir el comprobante");
        }
        const uploadJson = await uploadRes.json();
        comprobanteUrl = uploadJson.url;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: fechaPredefinida.toISOString(),
          cuenta,
          concepto,
          importe: parseFloat(importe),
          comprobanteUrl: comprobanteUrl || undefined,
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
    { value: 'Ingreso', label: 'Fondo General (Ingreso)' }
  ];

  return (
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
              <label className="block text-sm font-medium mb-2 text-gray-300">Comprobante (Opcional)</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="input-field w-full"
                style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)' }}
              />
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
    </div>
  );
}
