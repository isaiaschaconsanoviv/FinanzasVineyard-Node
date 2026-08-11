"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Receipt } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import Link from "next/link";

export default function GastosTable({ gastos }: { gastos: any[] }) {
  const router = useRouter();
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, idToDelete: string | null }>({ isOpen: false, idToDelete: null });

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
              <th style={{ textAlign: 'center' }}>Ticket</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id}>
                <td>{new Date(gasto.fecha).toLocaleDateString()}</td>
                <td style={{ fontWeight: 500 }}>{gasto.cuenta}</td>
                <td>{gasto.concepto}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="text-danger">
                  ${gasto.importe.toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {gasto.comprobanteUrl && (
                    <a href={gasto.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="btn-link" style={{ color: 'var(--accent-primary)' }} title="Ver Ticket">
                      <Receipt size={18} />
                    </a>
                  )}
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <Link href={`/gastos/${gasto.id}/editar`} className="btn-link" style={{ color: 'var(--text-secondary)' }} title="Editar">
                    <Edit2 size={16} />
                  </Link>
                  <button onClick={() => setConfirmModal({ isOpen: true, idToDelete: gasto.id })} className="btn-link text-danger" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
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
    </>
  );
}
