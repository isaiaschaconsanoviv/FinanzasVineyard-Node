import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export default async function CorteDetallePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const corte = await prisma.corte.findUnique({
    where: { id },
    include: { registros: true }
  });

  if (!corte) {
    notFound();
  }

  const registrosFiltrados = corte.registros.filter(r => r.concepto !== 'Pastor');

  const totalSistema = registrosFiltrados.reduce((sum, r) => sum + r.saldoSistema, 0);
  const totalFisico = registrosFiltrados.reduce((sum, r) => sum + r.saldoFisico, 0);
  const totalDiferencia = registrosFiltrados.reduce((sum, r) => sum + r.diferencia, 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <Link href="/cortes" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} />
          Volver a Cortes
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle del Corte</h1>
          <p className="text-gray-400 mt-2">
            Fecha: {new Date(corte.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 className="text-gray-400 mb-1 text-sm">Elaborado Por</h3>
          <p className="text-xl font-bold text-white">{corte.elaboradoPor}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 className="text-gray-400 mb-1 text-sm">Notas</h3>
          <p className="text-lg text-white">{corte.notas || "Sin notas"}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Desglose por Cuentas</h2>
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Cuenta / Concepto</th>
              <th style={{ textAlign: 'right' }}>Saldo en Sistema</th>
              <th style={{ textAlign: 'right' }}>Saldo Físico (Reportado)</th>
              <th style={{ textAlign: 'right' }}>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.concepto}</td>
                <td style={{ textAlign: 'right' }}>${r.saldoSistema.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>${r.saldoFisico.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }} className={r.diferencia < 0 ? "text-danger" : r.diferencia > 0 ? "text-accent" : "text-muted"}>
                  {r.diferencia > 0 ? '+' : ''}{r.diferencia === 0 ? '-' : `$${r.diferencia.toFixed(2)}`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
            <tr>
              <td style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>Totales</td>
              <td style={{ textAlign: 'right', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>${totalSistema.toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>${totalFisico.toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }} className={totalDiferencia < 0 ? "text-danger" : totalDiferencia > 0 ? "text-accent" : "text-white"}>
                {totalDiferencia > 0 ? '+' : ''}{totalDiferencia === 0 ? '-' : `$${totalDiferencia.toFixed(2)}`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
