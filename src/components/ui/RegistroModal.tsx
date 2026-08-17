import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Select } from './Select';

interface RegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
  entradaId: string;
  registroToEdit: any;
  onSaved: () => void;
  nombresUnicos: string[];
  conceptosUnicos: string[];
}

export function RegistroModal({ isOpen, onClose, entradaId, registroToEdit, onSaved, nombresUnicos, conceptosUnicos }: RegistroModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    diezmo: "",
    monedaDiezmo: "MXN",
    ofrenda: "",
    monedaOfrenda: "MXN"
  });
  const [otros, setOtros] = useState<{ id: number, tipo: string, importe: string, moneda: string }[]>([]);

  useEffect(() => {
    if (isOpen && registroToEdit) {
      setFormData({
        nombre: registroToEdit.nombre,
        diezmo: registroToEdit.diezmo ? registroToEdit.diezmo.toString() : "",
        monedaDiezmo: registroToEdit.monedaDiezmo || "MXN",
        ofrenda: registroToEdit.ofrenda ? registroToEdit.ofrenda.toString() : "",
        monedaOfrenda: registroToEdit.monedaOfrenda || "MXN"
      });
      setOtros(
        (registroToEdit.otrosRubros || []).map((o: any, idx: number) => ({
          id: Date.now() + idx,
          tipo: o.tipo,
          importe: o.importe.toString(),
          moneda: o.moneda || "MXN"
        }))
      );
      setError("");
    }
  }, [isOpen, registroToEdit]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted || !registroToEdit) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/entradas/${entradaId}/registros/${registroToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otros }),
      });

      if (!res.ok) throw new Error("Error al actualizar el registro");
      
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        width: '90%', maxWidth: '500px',
        padding: '2rem',
        animation: 'slideUp 0.3s ease-out',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 className="text-xl font-bold mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Editar Registro</h2>
        
        <form onSubmit={handleSubmit}>
          <datalist id="nombres-list-modal">
            {nombresUnicos.map(n => <option key={n} value={n} />)}
          </datalist>
          <datalist id="conceptos-list-modal">
            {conceptosUnicos.map(k => <option key={k} value={k} />)}
          </datalist>

          {error && <div className="text-danger mb-4 text-sm bg-danger/10 p-2 rounded">{error}</div>}
          
          <div className="input-group mb-4">
            <label>Nombre / Familia</label>
            <input type="text" name="nombre" list="nombres-list-modal" value={formData.nombre} onChange={handleChange} className="input-field" required autoFocus />
          </div>
          
          <div className="responsive-grid mb-4">
            <div className="input-group">
              <label>Diezmo</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                  <input type="number" step="0.01" name="diezmo" value={formData.diezmo} onChange={handleChange} className="input-field" style={{ width: '100%', paddingLeft: '2rem' }} placeholder="0.00" />
                </div>
                <div style={{ width: '90px' }}>
                  <Select
                    id="monedaDiezmo-modal"
                    name="monedaDiezmo"
                    value={formData.monedaDiezmo}
                    onChange={handleChange as any}
                    options={[
                      { value: "MXN", label: "MXN" },
                      { value: "USD", label: "USD" }
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Ofrenda</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                  <input type="number" step="0.01" name="ofrenda" value={formData.ofrenda} onChange={handleChange} className="input-field" style={{ width: '100%', paddingLeft: '2rem' }} placeholder="0.00" />
                </div>
                <div style={{ width: '90px' }}>
                  <Select
                    id="monedaOfrenda-modal"
                    name="monedaOfrenda"
                    value={formData.monedaOfrenda}
                    onChange={handleChange as any}
                    options={[
                      { value: "MXN", label: "MXN" },
                      { value: "USD", label: "USD" }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>Otros Rubros</h4>
              <button 
                type="button" 
                onClick={() => setOtros([...otros, { id: Date.now(), tipo: "", importe: "", moneda: "MXN" }])} 
                className="btn-link text-accent-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
              >
                <Plus size={14} /> Agregar Rubro
              </button>
            </div>

            {otros.map((otro) => (
              <div key={otro.id} className="otros-rubros-grid" style={{ marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  list="conceptos-list-modal"
                  value={otro.tipo} 
                  onChange={(e) => setOtros(otros.map(o => o.id === otro.id ? { ...o, tipo: e.target.value } : o))} 
                  className="input-field" 
                  placeholder="Concepto (ej. Evento)" 
                  required 
                />
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={otro.importe} 
                    onChange={(e) => setOtros(otros.map(o => o.id === otro.id ? { ...o, importe: e.target.value } : o))} 
                    className="input-field" 
                    style={{ width: '100%', paddingLeft: '1.75rem' }} 
                    placeholder="0.00" 
                    required 
                  />
                </div>
                <div>
                  <Select
                    id={`monedaOtro-${otro.id}-modal`}
                    name={`monedaOtro-${otro.id}-modal`}
                    value={otro.moneda}
                    onChange={(e) => setOtros(otros.map(o => o.id === otro.id ? { ...o, moneda: e.target.value } : o))}
                    options={[
                      { value: "MXN", label: "MXN" },
                      { value: "USD", label: "USD" }
                    ]}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => setOtros(otros.filter(o => o.id !== otro.id))} 
                  className="btn-link text-danger flex-center" 
                  title="Quitar rubro"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
