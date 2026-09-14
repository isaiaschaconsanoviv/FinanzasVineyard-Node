import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import EntradasTable from "./EntradasTable";

const prisma = new PrismaClient();

export default async function EntradasPage() {
  const entradas = await prisma.entrada.findMany({
    orderBy: { fecha: 'desc' },
    include: {
      registros: {
        include: { otrosRubros: true }
      }
    }
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="text-3xl font-bold">Historial de Entradas</h1>
        <Link href="/entradas/nuevo" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} />
          Nueva Entrada
        </Link>
      </div>

      <EntradasTable entradas={entradas} />
    </div>
  );
}
