"use client";
import { useState } from "react";

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
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cuenta</th>
              <th>Concepto</th>
              <th style={{ textAlign: 'right' }}>Importe</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'center' }}>Ticket</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id}>
                <td>{new Date(gasto.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
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
                <td style={{ textAlign: 'center' }}>
                  {gasto.comprobanteUrl && (
                    <button 
                      onClick={() => setViewerModal({ isOpen: true, fileUrl: gasto.comprobanteUrl })} 
                      className="btn-link" 
                      style={{ color: 'var(--accent-primary)' }} 
                      title="Ver Ticket"
                    >
                      <Receipt size={18} />
                    </button>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
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
            ))}
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
