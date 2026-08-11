"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Select } from "./Select";

interface ReglaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (regla: any) => Promise<void>;
  reglaInicial?: any;
}

export function ReglaModal({ isOpen, onClose, onSave, reglaInicial }: ReglaModalProps) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("PERCENTAGE");
  const [valor, setValor] = useState<number>(0);
  const [orden, setOrden] = useState<number>(1);
  const [ordenVisual, setOrdenVisual] = useState<number>(1);
  const [baseDeCalculo, setBaseDeCalculo] = useState("REMANENTE");
  const [redondeoDiez, setRedondeoDiez] = useState(false);
  const [condicionDia, setCondicionDia] = useState("");
  const [activo, setActivo] = useState(true);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (reglaInicial) {
        setNombre(reglaInicial.nombre);
        setTipo(reglaInicial.tipo);
        setValor(reglaInicial.valor);
        setOrden(reglaInicial.orden);
        setOrdenVisual(reglaInicial.ordenVisual || 1);
        setBaseDeCalculo(reglaInicial.baseDeCalculo || "REMANENTE");
        setRedondeoDiez(reglaInicial.redondeoDiez);
        setCondicionDia(reglaInicial.condicionDia || "");
        setActivo(reglaInicial.activo);
      } else {
        setNombre("");
        setTipo("PERCENTAGE");
        setValor(0);
        setOrden(1);
        setOrdenVisual(1);
        setBaseDeCalculo("REMANENTE");
        setRedondeoDiez(false);
        setCondicionDia("");
        setActivo(true);
      }
    }
  }, [isOpen, reglaInicial]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...(reglaInicial?.id ? { id: reglaInicial.id } : {}),
        nombre,
        tipo,
        valor: Number(valor),
        orden: Number(orden),
        ordenVisual: Number(ordenVisual),
        baseDeCalculo,
        redondeoDiez,
        condicionDia: condicionDia || null,
        activo
      };
      await onSave(data);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error al guardar regla");
    } finally {
      setSaving(false);
    }
  };

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
        width: '90%', maxWidth: '500px',
        padding: '2rem',
        animation: 'slideUp 0.3s ease-out',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="text-xl font-bold">{reglaInicial ? "Editar Regla" : "Nueva Regla"}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Nombre del Rubro</label>
            <input 
              type="text" 
              className="input-field w-full" 
              required 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              placeholder="Ej. Misiones"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Tipo de Descuento</label>
              <Select 
                id="tipo"
                name="tipo"
                options={[
                  { value: 'PERCENTAGE', label: 'Porcentaje (%)' },
                  { value: 'FIXED', label: 'Monto Fijo ($)' }
                ]}
                value={tipo} 
                onChange={e => setTipo(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Valor</label>
              <input 
                type="number" 
                step="0.01" 
                className="input-field w-full" 
                required 
                value={valor} 
                onChange={e => setValor(parseFloat(e.target.value))} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Base de Cálculo</label>
              <Select 
                id="baseDeCalculo"
                name="baseDeCalculo"
                options={[
                  { value: 'REMANENTE', label: 'Sobrante Actual' },
                  { value: 'BRUTO_DIEZMOS', label: 'Total Diezmos' },
                  { value: 'BRUTO_TOTAL', label: 'Total Bruto' }
                ]}
                value={baseDeCalculo} 
                onChange={e => setBaseDeCalculo(e.target.value)}
              />
              <span className="text-xs text-gray-400 mt-1 block">¿De dónde se descuenta?</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Orden de Cálculo (Matemático)</label>
              <input 
                type="number" 
                className="input-field w-full" 
                required 
                value={orden} 
                onChange={e => setOrden(parseInt(e.target.value))} 
              />
              <span className="text-xs text-gray-400 mt-1 block">1 = Se descuenta primero</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Orden Visual (En pantalla)</label>
              <input 
                type="number" 
                className="input-field w-full" 
                required 
                value={ordenVisual} 
                onChange={e => setOrdenVisual(parseInt(e.target.value))} 
              />
              <span className="text-xs text-gray-400 mt-1 block">1 = Aparece hasta arriba</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Condición (Opcional)</label>
              <Select 
                id="condicionDia"
                name="condicionDia"
                options={[
                  { value: '', label: 'Sin condición (Siempre)' },
                  { value: 'SUNDAY', label: 'Solo los Domingos' }
                ]}
                value={condicionDia} 
                onChange={e => setCondicionDia(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                checked={redondeoDiez}
                onChange={e => setRedondeoDiez(e.target.checked)}
              />
              <span className="text-sm">Redondear a decena (ej. $122 -{'>'} $130)</span>
            </label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                checked={activo}
                onChange={e => setActivo(e.target.checked)}
              />
              <span className="text-sm">Regla Activa</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-dark" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Regla"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
