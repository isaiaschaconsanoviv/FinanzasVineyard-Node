"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import GastosTable from "./GastosTable";
import { GastoModal } from "@/components/ui/GastoModal";
import { useRouter } from "next/navigation";

export default function GastosClient({ gastos, total }: { gastos: any[], total: number }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoToEdit, setGastoToEdit] = useState<any>(null);
  const router = useRouter();

  const handleOpenNew = () => {
    setGastoToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (gasto: any) => {
    setGastoToEdit(gasto);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setGastoToEdit(null);
    router.refresh();
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">Gastos Registrados</h1>
          <p className="text-gray-400 mt-2">
            Total Histórico: <span className="text-danger font-bold">${total.toFixed(2)}</span>
          </p>
        </div>
        <button onClick={handleOpenNew} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} />
          Registrar Gasto
        </button>
      </div>

      <GastosTable gastos={gastos} onEdit={handleOpenEdit} />

      <GastoModal 
        isOpen={modalOpen} 
        onClose={handleClose} 
        fechaPredefinida={new Date()} 
        gastoToEdit={gastoToEdit} 
      />
    </>
  );
}
