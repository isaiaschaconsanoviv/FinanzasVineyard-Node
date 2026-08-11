import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import GastosTable from "./GastosTable";

const prisma = new PrismaClient();

export default async function GastosPage() {
  const gastos = await prisma.gasto.findMany({
    orderBy: { fecha: 'desc' }
  });

  const total = gastos.reduce((sum, g) => sum + g.importe, 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">Gastos Registrados</h1>
          <p className="text-gray-400 mt-2">Total Histórico: <span className="text-danger font-bold">${total.toFixed(2)}</span></p>
        </div>
        <Link href="/gastos/nuevo" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} />
          Registrar Gasto
        </Link>
      </div>

      <GastosTable gastos={gastos} />
    </div>
  );
}
