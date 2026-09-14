"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Plus, Target, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

export default function PromesasPage() {
  const { data: session } = useSession();
  const isReadOnly = (session?.user as any)?.rol === "READONLY";
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFinTentativa: "",
    meta: "",
    activo: true
  });
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
      const res = await fetch('/api/proyectos-promesas');
      const data = await res.json();
      setProyectos(data);
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
      const res = await fetch('/api/proyectos-promesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al crear proyecto");
      }
      
      await fetchProyectos();
      setIsModalOpen(false);
      setFormData({
        nombre: "",
        descripcion: "",
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFinTentativa: "",
        meta: "",
        activo: true
      });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const calcularAvance = (proyecto: any) => {
    let totalPrometidoMXN = 0;
    let totalPrometidoUSD = 0;
    let totalAportadoMXN = 0;
    let totalAportadoUSD = 0;

    proyecto.promesas?.forEach((p: any) => {
      totalPrometidoMXN += p.cantidadMXN || 0;
      totalPrometidoUSD += p.cantidadUSD || 0;
      
      p.aportaciones?.forEach((a: any) => {
        if (a.moneda === 'MXN') totalAportadoMXN += a.cantidad;
        if (a.moneda === 'USD') totalAportadoUSD += a.cantidad;
      });
    });

    const objetivoMXN = proyecto.meta ? proyecto.meta : totalPrometidoMXN;
    const porcentajeMXN = objetivoMXN > 0 ? Math.min(100, Math.round((totalAportadoMXN / objetivoMXN) * 100)) : 0;

    return {
      totalPrometidoMXN,
      totalPrometidoUSD,
      totalAportadoMXN,
      totalAportadoUSD,
      porcentajeMXN
    };
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Cargando proyectos...</div>;
  }

  return (
    <div className="animate-fade-in pb-12">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 className="text-3xl font-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Target size={28} className="text-accent-primary" />
          Promesas
        </h1>
        {!isReadOnly && (
          <button 
            className="btn btn-primary" 
            style={{ gap: '0.5rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Nuevo Proyecto
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {proyectos.map((proyecto) => {
          const stats = calcularAvance(proyecto);
          
          return (
            <div key={proyecto.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', opacity: proyecto.activo ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 className="text-xl font-bold mb-1">{proyecto.nombre}</h3>
                  {proyecto.descripcion && <p className="text-sm text-gray-400">{proyecto.descripcion}</p>}
                </div>
                {!proyecto.activo && (
                  <span className="badge badge-dark">Inactivo</span>
                )}
              </div>

              <div style={{ margin: '1.5rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span className="text-gray-400">Progreso (MXN)</span>
                  <span className="font-bold">{stats.porcentajeMXN}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${stats.porcentajeMXN}%`, 
                      height: '100%', 
                      backgroundColor: 'var(--accent-primary)',
                      transition: 'width 0.5s ease'
                    }}
                  ></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <div>
                  <div className="text-gray-400 mb-1">Total Aportado</div>
                  <div className="font-bold text-success">${stats.totalAportadoMXN.toLocaleString('es-MX')} MXN</div>
                  {stats.totalAportadoUSD > 0 && <div className="font-bold text-success">${stats.totalAportadoUSD.toLocaleString('en-US')} USD</div>}
                </div>
                <div>
                  <div className="text-gray-400 mb-1">{proyecto.meta ? 'Meta' : 'Prometido'}</div>
                  <div className="font-bold">${proyecto.meta ? proyecto.meta.toLocaleString('es-MX') : stats.totalPrometidoMXN.toLocaleString('es-MX')} MXN</div>
                  {!proyecto.meta && stats.totalPrometidoUSD > 0 && <div className="font-bold">${stats.totalPrometidoUSD.toLocaleString('en-US')} USD</div>}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Link href={`/promesas/proyectos/${proyecto.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
                  Ver Detalle
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
        {proyectos.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay proyectos de promesas registrados. Crea uno nuevo para comenzar.
          </div>
        )}
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
            width: '90%', maxWidth: '500px',
            padding: '2rem',
            animation: 'slideUp 0.3s ease-out',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 className="text-xl font-bold mb-4">Nuevo Proyecto de Promesas</h2>
            
            {error && (
              <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Nombre del Proyecto</label>
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  className="input-field"
                  placeholder="Ej. Construcción Templo"
                  required 
                />
              </div>

              <div className="input-group">
                <label>Descripción (Opcional)</label>
                <textarea 
                  value={formData.descripcion} 
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})} 
                  className="input-field"
                  placeholder="Detalles sobre el proyecto..."
                  rows={2}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Fecha de Inicio</label>
                  <input 
                    type="date" 
                    value={formData.fechaInicio} 
                    onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})} 
                    className="input-field"
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Fecha Fin (Opcional)</label>
                  <input 
                    type="date" 
                    value={formData.fechaFinTentativa} 
                    onChange={(e) => setFormData({...formData, fechaFinTentativa: e.target.value})} 
                    className="input-field"
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Meta MXN (Opcional)</label>
                <input 
                  type="number" 
                  value={formData.meta} 
                  onChange={(e) => setFormData({...formData, meta: e.target.value})} 
                  className="input-field"
                  placeholder="Dejar en blanco si la meta es la suma de promesas"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary flex-1">Guardar Proyecto</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
