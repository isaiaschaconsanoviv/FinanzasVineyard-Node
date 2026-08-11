import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Historial de Cortes de Caja</h1>
          <p className="text-gray-400 mt-2">Periodos contabilizados y verificados</p>
        </div>
        <Link href="/cortes/nuevo" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={18} />
          Realizar Corte
        </Link>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha del Corte</th>
              <th>Elaborado Por</th>
              <th>Notas</th>
              <th style={{ textAlign: 'right' }}>Total Físico (MXN)</th>
              <th style={{ textAlign: 'right' }}>Diferencia Total</th>
            </tr>
          </thead>
          <tbody>
            {cortes.map((corte) => {
              const totalFisico = corte.registros.reduce((sum, r) => sum + r.saldoFisico, 0);
              const totalDiferencia = corte.registros.reduce((sum, r) => sum + r.diferencia, 0);

              return (
                <tr key={corte.id}>
                  <td style={{ fontWeight: 500 }}>
                    {new Date(corte.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td>{corte.elaboradoPor}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{corte.notas || '-'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="text-accent">
                    ${totalFisico.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }} className={totalDiferencia < 0 ? "text-danger" : totalDiferencia > 0 ? "text-accent" : "text-muted"}>
                    {totalDiferencia > 0 ? '+' : ''}{totalDiferencia === 0 ? '-' : `$${totalDiferencia.toFixed(2)}`}
                  </td>
                </tr>
              );
            })}
            {cortes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aún no se ha realizado ningún corte de caja.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
