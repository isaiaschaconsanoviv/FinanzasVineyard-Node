import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import CortesTable from "./CortesTable";

const prisma = new PrismaClient();

export default async function CortesPage() {
  const cortes = await prisma.corte.findMany({
    orderBy: { fecha: 'desc' },
    include: {
      registros: true
    }
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">Historial de Cortes de Caja</h1>
          <p className="text-gray-400 mt-2">Periodos contabilizados y verificados</p>
        </div>
        <Link href="/cortes/nuevo" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} />
          Realizar Corte
        </Link>
      </div>

      <CortesTable cortes={cortes} />
    </div>
  );
}
