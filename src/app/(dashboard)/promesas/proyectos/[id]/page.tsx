"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { ArrowLeft, Plus, DollarSign, Target, Calendar, Trash2, Edit2, UploadCloud, Image as ImageIcon, FileText, List } from "lucide-react";
import { useSession } from "next-auth/react";
import { FileViewerModal } from "@/components/ui/FileViewerModal";

export default function ProyectoPromesaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isReadOnly = (session?.user as any)?.rol === "READONLY";
  
  const [proyecto, setProyecto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [isPromesaModalOpen, setIsPromesaModalOpen] = useState(false);
  const [isAportacionModalOpen, setIsAportacionModalOpen] = useState(false);
  const [isHistorialModalOpen, setIsHistorialModalOpen] = useState(false);
  const [selectedPromesaHistorial, setSelectedPromesaHistorial] = useState<any>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isSubmittingAportacion, setIsSubmittingAportacion] = useState(false);
  const [fileToView, setFileToView] = useState<{ url: string, type: 'image' | 'pdf' } | null>(null);
  
  const [promesaForm, setPromesaForm] = useState({
    persona: "", cantidadMXN: "", cantidadUSD: "", fechaLimite: "", notas: ""
  });
  const [promesaToEdit, setPromesaToEdit] = useState<string | null>(null);
  
  const [aportacionForm, setAportacionForm] = useState({
    promesaId: "", cantidad: "", moneda: "MXN", fecha: new Date().toISOString().split('T')[0]
  });

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setMounted(true);
    fetchProyecto();
  }, [id]);

  const fetchProyecto = async () => {
    try {
      const res = await fetch(`/api/proyectos-promesas/${id}`);
      if (!res.ok) {
        if (res.status === 404) router.push('/promesas');
        return;
      }
      const data = await res.json();
      setProyecto(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePromesa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (promesaToEdit) {
        res = await fetch(`/api/promesas/${promesaToEdit}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(promesaForm)
        });
      } else {
        res = await fetch('/api/promesas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...promesaForm, proyectoId: id })
        });
      }
      
      if (res.ok) {
        setIsPromesaModalOpen(false);
        setPromesaForm({ persona: "", cantidadMXN: "", cantidadUSD: "", fechaLimite: "", notas: "" });
        setPromesaToEdit(null);
        fetchProyecto();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openNewPromesaModal = () => {
    setPromesaToEdit(null);
    setPromesaForm({ persona: "", cantidadMXN: "", cantidadUSD: "", fechaLimite: "", notas: "" });
    setIsPromesaModalOpen(true);
  };

  const openEditPromesaModal = (promesa: any) => {
    setPromesaToEdit(promesa.id);
    setPromesaForm({
      persona: promesa.persona,
      cantidadMXN: promesa.cantidadMXN || "",
      cantidadUSD: promesa.cantidadUSD || "",
      fechaLimite: promesa.fechaLimite ? new Date(promesa.fechaLimite).toISOString().split('T')[0] : "",
      notas: promesa.notas || ""
    });
    setIsPromesaModalOpen(true);
  };

  const handleSaveAportacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAportacion(true);
    try {
      let comprobanteUrl = null;
      if (fileToUpload) {
        const uploadData = new FormData();
        uploadData.append("files", fileToUpload);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          comprobanteUrl = uploadJson.urls ? uploadJson.urls[0] : uploadJson.url;
        }
      }

      const res = await fetch('/api/aportaciones-promesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aportacionForm, comprobante: comprobanteUrl })
      });
      if (res.ok) {
        setIsAportacionModalOpen(false);
        setAportacionForm({ promesaId: "", cantidad: "", moneda: "MXN", fecha: new Date().toISOString().split('T')[0] });
        setFileToUpload(null);
        fetchProyecto();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingAportacion(false);
    }
  };

  const handleDeletePromesa = async (promesaId: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta promesa y todas sus aportaciones?")) return;
    try {
      await fetch(`/api/promesas/${promesaId}`, { method: 'DELETE' });
      fetchProyecto();
    } catch (e) {
      console.error(e);
    }
  };

  const calcularEstadisticas = () => {
    if (!proyecto) return null;
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

    return { totalPrometidoMXN, totalPrometidoUSD, totalAportadoMXN, totalAportadoUSD, porcentajeMXN, objetivoMXN };
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando proyecto...</div>;
  if (!proyecto) return <div className="p-8 text-center text-gray-400">Proyecto no encontrado</div>;

  const stats = calcularEstadisticas()!;

  return (
    <div className="animate-fade-in pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .mobile-expanded-row { display: table-row !important; }
          .clickable-row { cursor: pointer; }
          .mobile-only-icon { display: inline-block !important; }
        }
        @media (min-width: 769px) {
          .mobile-expanded-row { display: none !important; }
          .mobile-only-icon { display: none !important; }
        }
      `}} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 min-content' }}>
          <Link href="/promesas" className="btn btn-dark" style={{ padding: '0.5rem', flexShrink: 0 }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ margin: 0, wordBreak: 'break-word' }}>{proyecto.nombre}</h1>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {!isReadOnly && (
            <>
              <button className="btn btn-dark" onClick={() => setIsAportacionModalOpen(true)}>
                <DollarSign size={18} /> Registrar Aportación
              </button>
              <button className="btn btn-primary" onClick={openNewPromesaModal}>
                <Plus size={18} /> Nueva Promesa
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="text-gray-400" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Target size={20} />
            <span className="font-semibold">{proyecto.meta ? 'Meta del Proyecto (MXN)' : 'Total Prometido (MXN)'}</span>
          </div>
          <div className="text-3xl font-bold">${stats.objetivoMXN.toLocaleString('es-MX')}</div>
          {stats.totalPrometidoUSD > 0 && <div className="text-sm text-gray-400 mt-1">Y ${stats.totalPrometidoUSD.toLocaleString('en-US')} USD prometidos</div>}
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="text-gray-400" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <DollarSign size={20} />
            <span className="font-semibold">Total Aportado (MXN)</span>
          </div>
          <div className="text-3xl font-bold text-success">${stats.totalAportadoMXN.toLocaleString('es-MX')}</div>
          {stats.totalAportadoUSD > 0 && <div className="text-sm text-gray-400 mt-1">Y ${stats.totalAportadoUSD.toLocaleString('en-US')} USD aportados</div>}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-gray-400 font-semibold">Avance General (MXN)</span>
            <span className="font-bold">{stats.porcentajeMXN}%</span>
          </div>
          <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${stats.porcentajeMXN}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-xl font-bold">Promesas Registradas</h2>
        </div>
        
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Prometido</th>
                <th>Aportado</th>
                <th className="hide-on-mobile">Pendiente</th>
                <th className="hide-on-mobile">Fecha Límite</th>
                {!isReadOnly && <th className="hide-on-mobile" style={{ textAlign: 'right' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {proyecto.promesas?.map((promesa: any) => {
                let aportadoMXN = 0;
                let aportadoUSD = 0;
                promesa.aportaciones?.forEach((a: any) => {
                  if (a.moneda === 'MXN') aportadoMXN += a.cantidad;
                  if (a.moneda === 'USD') aportadoUSD += a.cantidad;
                });

                return (
                  <React.Fragment key={promesa.id}>
                  <tr className="clickable-row" onClick={() => toggleRow(promesa.id)}>
                    <td className="font-bold">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="mobile-only-icon" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
                          {expandedRows[promesa.id] ? '▲' : '▼'}
                        </span>
                        {promesa.persona}
                      </div>
                    </td>
                    <td>
                      {promesa.cantidadMXN > 0 && <div>${promesa.cantidadMXN.toLocaleString('es-MX')} MXN</div>}
                      {promesa.cantidadUSD > 0 && <div>${promesa.cantidadUSD.toLocaleString('en-US')} USD</div>}
                    </td>
                    <td className="text-success font-semibold">
                      {aportadoMXN > 0 && <div>${aportadoMXN.toLocaleString('es-MX')} MXN</div>}
                      {aportadoUSD > 0 && <div>${aportadoUSD.toLocaleString('en-US')} USD</div>}
                      {aportadoMXN === 0 && aportadoUSD === 0 && <span className="text-gray-500">$0</span>}
                    </td>
                    <td className="text-warning hide-on-mobile">
                      {(promesa.cantidadMXN - aportadoMXN) > 0 && <div>${(promesa.cantidadMXN - aportadoMXN).toLocaleString('es-MX')} MXN</div>}
                      {(promesa.cantidadUSD - aportadoUSD) > 0 && <div>${(promesa.cantidadUSD - aportadoUSD).toLocaleString('en-US')} USD</div>}
                    </td>
                    <td className="hide-on-mobile">
                      {promesa.fechaLimite ? new Date(promesa.fechaLimite).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : <span className="text-gray-500">Sin límite</span>}
                    </td>
                    {!isReadOnly && (
                      <td className="hide-on-mobile" style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-dark btn-sm" 
                          style={{ padding: '0.4rem', marginRight: '0.5rem' }}
                          title="Ver Historial de Aportaciones"
                          onClick={(e) => { e.stopPropagation(); setSelectedPromesaHistorial(promesa); setIsHistorialModalOpen(true); }}
                        >
                          <List size={16} />
                        </button>
                        <button 
                          className="btn btn-dark btn-sm" 
                          style={{ padding: '0.4rem', marginRight: '0.5rem' }}
                          onClick={(e) => { e.stopPropagation(); openEditPromesaModal(promesa); }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          style={{ padding: '0.4rem' }}
                          onClick={(e) => { e.stopPropagation(); handleDeletePromesa(promesa.id); }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                  
                  {/* Fila expandida para celular */}
                  {expandedRows[promesa.id] && (
                    <tr className="mobile-expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <td colSpan={3} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-gray-400 text-sm">Pendiente:</span>
                            <span className="text-warning font-bold">
                              {(promesa.cantidadMXN - aportadoMXN) > 0 && <div>${(promesa.cantidadMXN - aportadoMXN).toLocaleString('es-MX')} MXN</div>}
                              {(promesa.cantidadUSD - aportadoUSD) > 0 && <div>${(promesa.cantidadUSD - aportadoUSD).toLocaleString('en-US')} USD</div>}
                              {(promesa.cantidadMXN - aportadoMXN) === 0 && (promesa.cantidadUSD - aportadoUSD) === 0 && <span>$0</span>}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-gray-400 text-sm">Fecha Límite:</span>
                            <span>{promesa.fechaLimite ? new Date(promesa.fechaLimite).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : <span className="text-gray-500">Sin límite</span>}</span>
                          </div>
                          
                          {!isReadOnly && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                              <button 
                                className="btn btn-dark btn-sm flex-1" 
                                style={{ padding: '0.5rem', justifyContent: 'center' }}
                                onClick={() => { setSelectedPromesaHistorial(promesa); setIsHistorialModalOpen(true); }}
                              >
                                <List size={16} style={{ marginRight: '0.25rem' }} /> Historial
                              </button>
                              <button 
                                className="btn btn-dark btn-sm flex-1" 
                                style={{ padding: '0.5rem', justifyContent: 'center' }}
                                onClick={() => openEditPromesaModal(promesa)}
                              >
                                <Edit2 size={16} style={{ marginRight: '0.25rem' }} /> Editar
                              </button>
                              <button 
                                className="btn btn-danger btn-sm flex-1" 
                                style={{ padding: '0.5rem', justifyContent: 'center' }}
                                onClick={() => handleDeletePromesa(promesa.id)}
                              >
                                <Trash2 size={16} style={{ marginRight: '0.25rem' }} /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}
              {(!proyecto.promesas || proyecto.promesas.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Aún no hay promesas registradas en este proyecto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Promesa */}
      {isPromesaModalOpen && mounted && createPortal(
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="text-xl font-bold mb-4">{promesaToEdit ? 'Editar Promesa' : 'Nueva Promesa'}</h2>
            <form onSubmit={handleSavePromesa} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Nombre de la Persona / Donante</label>
                <input type="text" className="input-field" required 
                  value={promesaForm.persona} onChange={e => setPromesaForm({...promesaForm, persona: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="input-group" style={{ flex: '1 1 120px' }}>
                  <label>Cantidad (MXN)</label>
                  <input type="number" className="input-field" 
                    value={promesaForm.cantidadMXN} onChange={e => setPromesaForm({...promesaForm, cantidadMXN: e.target.value})} 
                  />
                </div>
                <div className="input-group" style={{ flex: '1 1 120px' }}>
                  <label>Cantidad (USD)</label>
                  <input type="number" className="input-field" 
                    value={promesaForm.cantidadUSD} onChange={e => setPromesaForm({...promesaForm, cantidadUSD: e.target.value})} 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Fecha Límite (Opcional)</label>
                <input type="date" className="input-field" 
                  value={promesaForm.fechaLimite} onChange={e => setPromesaForm({...promesaForm, fechaLimite: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary flex-1" onClick={() => { setIsPromesaModalOpen(false); setPromesaToEdit(null); }}>Cancelar</button>
                <button type="submit" className="btn btn-primary flex-1">Guardar</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Registrar Aportación */}
      {isAportacionModalOpen && mounted && createPortal(
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <h2 className="text-xl font-bold mb-4">Registrar Aportación</h2>
            <form onSubmit={handleSaveAportacion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Promesa de...</label>
                <Select
                  id="promesaId"
                  name="promesaId"
                  required
                  value={aportacionForm.promesaId}
                  onChange={e => setAportacionForm({...aportacionForm, promesaId: e.target.value})}
                  options={
                    proyecto.promesas?.map((p: any) => ({
                      value: p.id,
                      label: p.persona
                    })) || []
                  }
                />
              </div>
              <div className="input-group">
                <label>Cantidad</label>
                <input type="number" className="input-field" required 
                  value={aportacionForm.cantidad} onChange={e => setAportacionForm({...aportacionForm, cantidad: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>Moneda</label>
                <Select
                  id="moneda"
                  name="moneda"
                  required
                  value={aportacionForm.moneda}
                  onChange={e => setAportacionForm({...aportacionForm, moneda: e.target.value})}
                  options={[
                    { value: "MXN", label: "Pesos (MXN)" },
                    { value: "USD", label: "Dólares (USD)" }
                  ]}
                />
              </div>
              <div className="input-group">
                <label>Fecha de Aportación</label>
                <input type="date" className="input-field" required 
                  value={aportacionForm.fecha} onChange={e => setAportacionForm({...aportacionForm, fecha: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>Comprobante (Opcional)</label>
                {fileToUpload ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed var(--accent-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <ImageIcon size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                      <span className="text-sm truncate" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{fileToUpload.name}</span>
                    </div>
                    <button type="button" onClick={() => setFileToUpload(null)} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      id="comprobante-upload"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFileToUpload(e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="comprobante-upload" className="btn btn-secondary w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderStyle: 'dashed', cursor: 'pointer' }}>
                      <UploadCloud size={18} />
                      <span>Seleccionar Archivo</span>
                    </label>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary flex-1" onClick={() => { setIsAportacionModalOpen(false); setFileToUpload(null); }} disabled={isSubmittingAportacion}>Cancelar</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={isSubmittingAportacion}>
                  {isSubmittingAportacion ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* Modal Historial de Aportaciones */}
      {isHistorialModalOpen && selectedPromesaHistorial && mounted && createPortal(
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', padding: '2rem', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="text-xl font-bold">Historial de Aportaciones</h2>
              <button className="btn btn-dark btn-sm" onClick={() => { setIsHistorialModalOpen(false); setSelectedPromesaHistorial(null); }}>Cerrar</button>
            </div>
            <p className="text-gray-400 mb-4">Promesa de: <span className="font-semibold text-white">{selectedPromesaHistorial.persona}</span></p>
            
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {selectedPromesaHistorial.aportaciones && selectedPromesaHistorial.aportaciones.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedPromesaHistorial.aportaciones.map((aportacion: any) => (
                    <div key={aportacion.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div className="font-bold text-lg text-success">${aportacion.cantidad.toLocaleString()} {aportacion.moneda}</div>
                        <div className="text-sm text-gray-400">{new Date(aportacion.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' })}</div>
                      </div>
                      {aportacion.comprobante && (
                        <button 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '0.5rem 1rem' }}
                          onClick={() => setFileToView({ 
                            url: aportacion.comprobante, 
                            type: aportacion.comprobante.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image' 
                          })}
                        >
                          <FileText size={16} className="mr-2" /> Ver Comprobante
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No hay aportaciones registradas para esta promesa.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Visor de Archivos */}
      <FileViewerModal 
        isOpen={!!fileToView} 
        onClose={() => setFileToView(null)}
        fileUrl={fileToView?.url || ''}
      />
    </div>
  );
}
