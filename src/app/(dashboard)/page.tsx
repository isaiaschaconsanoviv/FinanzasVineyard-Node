import { DollarSign, TrendingUp } from "lucide-react";
import ExchangeRateChart from "./ExchangeRateChart";
import EntradasChart from "./EntradasChart";
import { PrismaClient } from "@prisma/client";
import { calcularSaldosActuales } from "@/lib/balances";

const prisma = new PrismaClient();

async function getDashboardStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 1. Entradas del mes
    const entradas = await prisma.entrada.findMany({
      where: { fecha: { gte: startOfMonth } }
    });
    
    let entradasMes = entradas.reduce((sum, e) => sum + e.ingreso, 0);

    // 2. Gastos del mes
    const gastos = await prisma.gasto.findMany({
      where: { fecha: { gte: startOfMonth } }
    });
    
    let gastosMes = gastos.reduce((sum, g) => sum + g.importe, 0);

    // 3. Filtrar solo las cuentas oficiales de distribucion (no otros rubros, ni pastor)
    const saldos = await calcularSaldosActuales(prisma);
    const reglas = await prisma.reglaDistribucion.findMany();
    
    const cuentasAExcluir = ["Ingreso", "Pastor", "Aguinaldo Pastor", "Apoyo gasolina", "Apoyo celular", "Bono Pastor Domingo", "Bono Pastor Ultimo Domingo"];
    const cuentasOficiales = [...reglas.map(r => r.nombre)].filter(c => !cuentasAExcluir.includes(c) && !c.toLowerCase().includes("pastor"));
    
    const saldosFiltrados: Record<string, number> = {};
    for (const key in saldos) {
      if (cuentasOficiales.includes(key)) {
        saldosFiltrados[key] = saldos[key];
      }
    }

    // 4. Balance General (Suma de los rubros principales)
    let balanceGeneral = Object.values(saldosFiltrados).reduce((sum, val) => sum + val, 0);

    return {
      entradasMes,
      gastosMes,
      balanceGeneral,
      saldos: saldosFiltrados
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { entradasMes: 0, gastosMes: 0, balanceGeneral: 0, saldos: {} };
  }
}

async function getHistoricalRates() {
  try {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 30); // 30 days window
    
    const endStr = today.toISOString().split('T')[0];
    const startStr = past.toISOString().split('T')[0];
    
    const res = await fetch(`https://api.frankfurter.app/${startStr}..${endStr}?from=USD&to=MXN`, { 
      next: { revalidate: 3600 } 
    });
    const data = await res.json();
    
    if (!data.rates) return [];
    
    const chartData = [];
    const d = new Date();
    
    const targetDates = [];
    targetDates.push({ date: new Date(d), label: 'Hoy' });
    
    let lastSunday = new Date(d);
    lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());
    
    let sundaysAdded = 0;
    let curr = new Date(lastSunday);
    while (sundaysAdded < 3) {
      if (curr.toDateString() !== today.toDateString()) {
        targetDates.unshift({ date: new Date(curr), label: `Dom ${curr.getDate()}` });
        sundaysAdded++;
      }
      curr.setDate(curr.getDate() - 7);
    }
    
    for (const target of targetDates) {
      let rate = null;
      let attempt = new Date(target.date);
      for (let j = 0; j < 4; j++) {
        const dateStr = attempt.toISOString().split('T')[0];
        if (data.rates[dateStr]?.MXN) {
          rate = data.rates[dateStr].MXN;
          break;
        }
        attempt.setDate(attempt.getDate() - 1);
      }
      if (rate) {
        chartData.push({ name: target.label, rate });
      }
    }
    
    return chartData;
  } catch (error) {
    console.error("Error fetching historical rates:", error);
    return [];
  }
}

async function getEntradasHistoricoMes() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const entradas = await prisma.entrada.findMany({
      where: { fecha: { gte: startOfMonth } },
      select: { fecha: true, ingreso: true }
    });

    const daysInMonth = now.getDate(); // Up to today
    const chartData = [];
    
    // Inicializar el arreglo con 0 para cada día hasta el día de hoy
    const dailyTotals: Record<number, number> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      dailyTotals[i] = 0;
    }

    entradas.forEach(e => {
      // Extraemos el día usando UTC para evitar desfases si la fecha se guardó en medianoche UTC
      const day = e.fecha.getUTCDate();
      if (day >= 1 && day <= daysInMonth) {
         dailyTotals[day] += e.ingreso;
      }
    });

    for (let i = 1; i <= daysInMonth; i++) {
      chartData.push({ name: i.toString(), total: dailyTotals[i] });
    }

    return chartData;
  } catch (error) {
    console.error("Error fetching historico entradas:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const chartData = await getHistoricalRates();
  const entradasChartData = await getEntradasHistoricoMes();
  const mxnRate = chartData.length > 0 ? chartData[chartData.length - 1].rate : null;
  const stats = await getDashboardStats();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Resumen General</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel p-8">
          <h3 className="text-gray-400 mb-2">Entradas del Mes</h3>
          <p className="text-3xl font-bold text-success">{formatCurrency(stats.entradasMes)}</p>
        </div>
        
        <div className="glass-panel p-8">
          <h3 className="text-gray-400 mb-2">Gastos del Mes</h3>
          <p className="text-3xl font-bold text-danger">{formatCurrency(stats.gastosMes)}</p>
        </div>

        <div className="glass-panel p-8">
          <h3 className="text-gray-400 mb-2">Balance General Total</h3>
          <p className="text-3xl font-bold text-purple">{formatCurrency(stats.balanceGeneral)}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 mt-8">Saldos por Cuenta</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {Object.entries(stats.saldos).map(([cuenta, saldo]) => (
          <div key={cuenta} className="glass-panel p-8">
            <h3 className="text-gray-400 mb-2">{cuenta}</h3>
            <p className="text-3xl font-bold text-white">{formatCurrency(saldo as number)}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Gráfica de Entradas */}
        <div className="glass-panel p-8" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(0,0,0,0.2))', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 className="text-gray-400 mb-2">Histórico de Ingresos</h3>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(stats.entradasMes)} <span className="text-sm font-normal text-gray-400">este mes</span>
              </p>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', color: '#34d399' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <EntradasChart data={entradasChartData} />
        </div>

        {/* Gráfica de Tipo de Cambio */}
        <div className="glass-panel p-8" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(0,0,0,0.2))', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 className="text-gray-400 mb-2">Tipo de Cambio (USD)</h3>
              <p className="text-3xl font-bold text-white">
                {mxnRate ? `$${mxnRate.toFixed(2)} MXN` : 'No disponible'}
              </p>
            </div>
            <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '50%', color: '#c4b5fd' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <ExchangeRateChart data={chartData} />
        </div>

      </div>
    </div>
  );
}
