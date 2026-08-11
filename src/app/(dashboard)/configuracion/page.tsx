"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, GripVertical, Beaker } from "lucide-react";
import { ReglaModal } from "@/components/ui/ReglaModal";
import { TestSombraModal } from "@/components/ui/TestSombraModal";

export default function ConfiguracionPage() {
  const [reglas, setReglas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [reglaToEdit, setReglaToEdit] = useState<any>(null);
  
  useEffect(() => {
    fetchReglas();
  }, []);

  const fetchReglas = async () => {
    try {
      const res = await fetch('/api/reglas');
      const data = await res.json();
      setReglas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRegla = async (reglaData: any) => {
    try {
      const url = '/api/reglas';
      const method = reglaData.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reglaData)
      });
      
      if (!res.ok) throw new Error("Error al guardar");
      
      await fetchReglas();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeleteRegla = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta regla? Esto afectará los cálculos futuros.")) return;
    try {
      const res = await fetch(`/api/reglas?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Error al eliminar");
      await fetchReglas();
    } catch (e) {
      console.error(e);
      alert("Error al eliminar");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Cargando configuración...</div>;
  }

  return (
    <div className="animate-fade-in pb-12">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 className="text-3xl font-bold">Motor de Distribución</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            style={{ gap: '0.5rem' }}
            onClick={() => setIsTestModalOpen(true)}
          >
            <Beaker size={18} />
            Probar Motor Sombra
          </button>
          <button 
            className="btn btn-primary" 
            style={{ gap: '0.5rem' }}
            onClick={() => {
              setReglaToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            Nueva Regla
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-xl font-bold text-white mb-2">Reglas Activas (Modo Sombra)</h2>
          <p className="text-sm text-gray-400">
            Estas reglas definen cómo se reparte el dinero de cada entrada. El sistema actualmente las evalúa en secreto 
            junto con el algoritmo antiguo para validar que no haya discrepancias.
          </p>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Orden</th>
              <th>Rubro</th>
              <th>Base de Cálculo</th>
              <th style={{ textAlign: 'right' }}>Valor</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reglas.map((regla) => (
              <tr key={regla.id} style={{ opacity: regla.activo ? 1 : 0.5 }}>
                <td style={{ color: 'var(--text-muted)', cursor: 'grab' }}><GripVertical size={18} /></td>
                <td className="font-bold">{regla.orden}</td>
                <td>
                  <div className="font-bold">{regla.nombre}</div>
                  {regla.condicionDia && <div className="text-xs text-purple-400">Solo si es {regla.condicionDia}</div>}
                </td>
                <td className="text-sm text-gray-300">
                  {regla.baseDeCalculo === "BRUTO_DIEZMOS" ? "Total Diezmos" : 
                   regla.baseDeCalculo === "REMANENTE" ? "Sobrante Actual" : 
                   regla.baseDeCalculo === "BRUTO_TOTAL" ? "Total Bruto" : regla.baseDeCalculo}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="text-success">
                  {regla.tipo === "PERCENTAGE" ? `${regla.valor}%` : `$${regla.valor}`}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className="btn btn-dark btn-sm" 
                    style={{ padding: '0.4rem', marginRight: '0.5rem' }}
                    onClick={() => {
                      setReglaToEdit(regla);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    style={{ padding: '0.4rem' }}
                    onClick={() => handleDeleteRegla(regla.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {reglas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay reglas configuradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ReglaModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRegla}
        reglaInicial={reglaToEdit}
      />
      <TestSombraModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
