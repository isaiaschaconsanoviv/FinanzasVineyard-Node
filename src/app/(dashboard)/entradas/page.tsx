import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";

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

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha del Servicio</th>
              <th style={{ textAlign: 'right' }}>Tasa de Cambio</th>
              <th>Elaborado Por</th>
              <th style={{ textAlign: 'right' }}>Ingreso Neto</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((entrada) => {
              return (
                <tr key={entrada.id}>
                  <td style={{ fontWeight: 500 }}>{new Date(entrada.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC' })}</td>
                  <td style={{ textAlign: 'right' }}>${entrada.tipoCambio.toFixed(2)}</td>
                  <td>{entrada.elaboradoPor}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="text-success">
                    ${entrada.ingreso.toFixed(2)} MXN
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/entradas/${entrada.id}`} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Ver / Editar</Link>
                  </td>
                </tr>
              );
            })}
            {entradas.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay entradas registradas. Presiona "Nueva Entrada" para comenzar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
