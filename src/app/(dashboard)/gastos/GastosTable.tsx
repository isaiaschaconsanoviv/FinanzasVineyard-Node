"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { Edit2, Trash2, Receipt } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FileViewerModal } from "@/components/ui/FileViewerModal";

export default function GastosTable({ gastos, onEdit, session }: { gastos: any[], onEdit: (gasto: any) => void, session: any }) {
  const userRole = (session?.user as any)?.rol || "READONLY";
  const userName = (session?.user as any)?.name || "";
  const router = useRouter();
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, idToDelete: string | null }>({ isOpen: false, idToDelete: null });
  const [viewerModal, setViewerModal] = useState<{ isOpen: boolean, fileUrl: string | null }>({ isOpen: false, fileUrl: null });
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const canEdit = (gasto: any) => {
    if (userRole === "ADMIN" || userRole === "STAFF") return true;
    if (userRole === "GASTOS" && gasto.elaboradoPor === userName) return true;
    return false;
  };

  const handleDelete = async () => {
    if (!confirmModal.idToDelete) return;
    try {
      const res = await fetch(`/api/gastos/${confirmModal.idToDelete}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Error al eliminar gasto");
      }
    } catch (err) {
      alert("Error al eliminar gasto");
    } finally {
      setConfirmModal({ isOpen: false, idToDelete: null });
    }
  };

  return (
    <>
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
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cuenta</th>
              <th>Concepto</th>
              <th style={{ textAlign: 'right' }}>Importe</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th className="hide-on-mobile" style={{ textAlign: 'center' }}>Ticket</th>
              <th className="hide-on-mobile" style={{ width: '80px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => {
              const isExpanded = expandedRows[gasto.id];
              return (
                <React.Fragment key={gasto.id}>
                  <tr className="clickable-row" onClick={() => toggleRow(gasto.id)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="mobile-only-icon" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                        {new Date(gasto.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </td>
                <td style={{ fontWeight: 500 }}>{gasto.cuenta}</td>
                <td>{gasto.concepto}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="text-danger">
                  ${gasto.importe.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${gasto.pagado ? 'badge-primary' : 'badge-secondary'}`} style={{ 
                    background: gasto.pagado ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: gasto.pagado ? 'var(--success)' : 'var(--warning)',
                    border: `1px solid ${gasto.pagado ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}>
                    {gasto.pagado ? 'Pagado' : 'Pendiente'}
                  </span>
                </td>
                <td className="hide-on-mobile" style={{ textAlign: 'center' }}>
                  {(() => {
                    const comp = gasto.comprobantes?.length > 0 ? gasto.comprobantes : [];
                    return (
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {comp.map((url: string, idx: number) => (
                          <button 
                            key={idx}
                            onClick={() => setViewerModal({ isOpen: true, fileUrl: url })} 
                            className="btn-link" 
                            style={{ color: 'var(--accent-primary)' }} 
                            title={`Ver Ticket ${idx + 1}`}
                          >
                            <Receipt size={18} />
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </td>
                <td className="hide-on-mobile" style={{ textAlign: 'center' }}>
                  {canEdit(gasto) ? (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                      <button onClick={() => onEdit(gasto)} className="btn-link" style={{ color: 'var(--text-secondary)' }} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setConfirmModal({ isOpen: true, idToDelete: gasto.id })} className="btn-link text-danger" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                </tr>
                {/* Fila expandida para celular */}
                {isExpanded && (
                  <tr className="mobile-expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <td colSpan={5} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="text-gray-400 text-sm">Tickets / Comprobantes:</span>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {gasto.comprobantes?.length > 0 ? gasto.comprobantes.map((url: string, idx: number) => (
                              <button 
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setViewerModal({ isOpen: true, fileUrl: url }); }} 
                                className="btn-link" 
                                style={{ color: 'var(--accent-primary)' }} 
                                title={`Ver Ticket ${idx + 1}`}
                              >
                                <Receipt size={20} />
                              </button>
                            )) : <span className="text-gray-500 text-sm">Ninguno</span>}
                          </div>
                        </div>

                        {canEdit(gasto) && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button 
                              className="btn btn-dark btn-sm flex-1" 
                              style={{ padding: '0.5rem', justifyContent: 'center' }}
                              onClick={(e) => { e.stopPropagation(); onEdit(gasto); }}
                            >
                              <Edit2 size={16} style={{ marginRight: '0.25rem' }} /> Editar
                            </button>
                            <button 
                              className="btn btn-danger btn-sm flex-1" 
                              style={{ padding: '0.5rem', justifyContent: 'center' }}
                              onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, idToDelete: gasto.id }); }}
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
            {gastos.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay gastos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, idToDelete: null })} 
        onConfirm={handleDelete} 
        title="Eliminar Gasto" 
        message="¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer." 
        confirmText="Sí, eliminar" 
        cancelText="Cancelar" 
        isDanger={true} 
      />

      <FileViewerModal 
        isOpen={viewerModal.isOpen} 
        fileUrl={viewerModal.fileUrl} 
        onClose={() => setViewerModal({ isOpen: false, fileUrl: null })} 
      />
    </>
  );
}
