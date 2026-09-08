import { PrismaClient } from "@prisma/client";
import { calcularSaldosActuales } from "@/lib/balances";
import { PieChart, Heart, Globe, Plane, Calendar, Gift, Landmark, Hammer, Wallet, Shield } from "lucide-react";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function SaldosPage() {
  const saldos = await calcularSaldosActuales(prisma);
  
  // Filtrar la cuenta de "Pastor" según requerimientos
  const saldosFiltrados = Object.entries(saldos).filter(([cuenta]) => cuenta !== 'Pastor');
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  const getAccountIcon = (cuenta: string) => {
    if (cuenta.includes("Diezmo")) return <Heart size={18} />;
    if (cuenta.includes("Nacional")) return <Globe size={18} />;
    if (cuenta.includes("Misiones")) return <Plane size={18} />;
    if (cuenta.includes("Eventos")) return <Calendar size={18} />;
    if (cuenta.includes("Aguinaldo")) return <Gift size={18} />;
    if (cuenta === "Ingreso") return <Landmark size={18} />;
    if (cuenta.includes("Construcción")) return <Hammer size={18} />;
    if (cuenta.includes("Fondo")) return <Shield size={18} />;
    return <Wallet size={18} />;
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reporte de Saldos</h1>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ marginBottom: '0.25rem' }}>Saldos Disponibles por Cuenta</h2>
            <p className="text-[var(--text-muted)] text-sm">Resumen completo y actualizado del efectivo disponible en todos los fondos de la iglesia.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Cuenta / Fondo</th>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Saldo Actual</th>
              </tr>
            </thead>
            <tbody>
              {saldosFiltrados.map(([cuenta, saldo], index) => {
                const numSaldo = Number(saldo);
                const isNegative = numSaldo < 0;
                const isZero = numSaldo === 0;
                
                return (
                  <tr 
                    key={cuenta} 
                    className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    style={{ borderBottom: index === saldosFiltrados.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                          {getAccountIcon(cuenta)}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{cuenta}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.4rem 1rem', 
                        borderRadius: '9999px', 
                        backgroundColor: isNegative ? 'rgba(239, 68, 68, 0.1)' : isZero ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)', 
                        color: isNegative ? '#ef4444' : isZero ? 'var(--text-muted)' : '#10b981', 
                        fontWeight: 600,
                        fontSize: '1rem',
                        border: `1px solid ${isNegative ? 'rgba(239, 68, 68, 0.2)' : isZero ? 'rgba(255,255,255,0.1)' : 'rgba(16, 185, 129, 0.2)'}`
                      }}>
                        {formatCurrency(numSaldo)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
