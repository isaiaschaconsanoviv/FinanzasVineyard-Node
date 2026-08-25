"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";

export default function CuentasPage() {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cuentaToEdit, setCuentaToEdit] = useState<any>(null);
  const [formData, setFormData] = useState({ nombre: "", activa: true });
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCuentas();
  }, []);

  const fetchCuentas = async () => {
    try {
      const res = await fetch('/api/cuentas');
      const data = await res.json();
      setCuentas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      let res;
      if (cuentaToEdit) {
        res = await fetch(`/api/cuentas/${cuentaToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch('/api/cuentas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }
      
      await fetchCuentas();
      setIsModalOpen(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta cuenta? Esto no eliminará los gastos históricos, pero la cuenta ya no estará disponible.")) return;
    try {
      const res = await fetch(`/api/cuentas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Error al eliminar");
      await fetchCuentas();
    } catch (e) {
      console.error(e);
      alert("Error al eliminar");
    }
  };

  const openModal = (cuenta: any = null) => {
    setError("");
    if (cuenta) {
      setCuentaToEdit(cuenta);
      setFormData({ nombre: cuenta.nombre, activa: cuenta.activa });
    } else {
      setCuentaToEdit(null);
      setFormData({ nombre: "", activa: true });
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Cargando cuentas...</div>;
  }

  return (
    <div className="animate-fade-in pb-12">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/configuracion" className="btn btn-dark" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-3xl font-bold">Cuentas Personalizadas</h1>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ gap: '0.5rem' }}
          onClick={() => openModal()}
        >
          <Plus size={18} />
          Nueva Cuenta
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-xl font-bold text-white mb-2">Catálogo de Cuentas</h2>
          <p className="text-sm text-gray-400">
            Administra las cuentas y fondos especiales (ej. Construcción, Despensas). Estas cuentas aparecerán 
            disponibles para recibir ingresos (Otros Rubros) y registrar gastos.
          </p>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre de la Cuenta</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentas.map((cuenta) => (
              <tr key={cuenta.id} style={{ opacity: cuenta.activa ? 1 : 0.5 }}>
                <td className="font-bold">{cuenta.nombre}</td>
                <td>
                  <span className={`badge ${cuenta.activa ? 'badge-success' : 'badge-dark'}`}>
                    {cuenta.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className="btn btn-dark btn-sm" 
                    style={{ padding: '0.4rem', marginRight: '0.5rem' }}
                    onClick={() => openModal(cuenta)}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    style={{ padding: '0.4rem' }}
                    onClick={() => handleDelete(cuenta.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {cuentas.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay cuentas personalizadas configuradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && mounted && createPortal(
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
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 className="text-xl font-bold mb-4">{cuentaToEdit ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
            
            {error && (
              <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label>Nombre de la Cuenta</label>
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  className="input-field"
                  placeholder="Ej. Construcción"
                  required 
                />
              </div>

              <div className="input-group mt-4" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="activa"
                  checked={formData.activa} 
                  onChange={(e) => setFormData({...formData, activa: e.target.checked})} 
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent-primary)' }}
                />
                <label htmlFor="activa" style={{ margin: 0, cursor: 'pointer' }}>Cuenta Activa</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary flex-1">Guardar</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
