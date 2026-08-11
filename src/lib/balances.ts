import { PrismaClient } from '@prisma/client';
import { calcularDistribucionDinamica } from "./reglasEngine";

const prisma = new PrismaClient();

export interface SaldosCuenta {
  [cuenta: string]: number; // MXN balance
}

export async function calcularDistribucion(entrada: any): Promise<Record<string, number>> {
  let totalDiezmosMXN = 0;
  let totalOfrendasMXN = 0;

  const toMXN = (importe: number, moneda: string) => {
    if (moneda === "USD") return importe * entrada.tipoCambio;
    return importe;
  };

  entrada.registros.forEach((r: any) => {
    totalDiezmosMXN += toMXN(r.diezmo, r.monedaDiezmo);
    totalOfrendasMXN += toMXN(r.ofrenda, r.monedaOfrenda);
  });

  let t10pdiezmo = 0;
  let t3pnacional = 0;
  let t10pmisiones = 0;
  let t5peventos = 0;
  let totalfinalpastor = 0;
  let aguinaldoPastor = 0;
  let ingreso = 0;

  const sumDiezmosOfrendas = totalDiezmosMXN + totalOfrendasMXN;
  const dateObj = new Date(entrada.fecha);
  const IsSunday = dateObj.getUTCDay() === 0;

  if (sumDiezmosOfrendas > 500) {
    t10pdiezmo = totalDiezmosMXN * 0.10;
    let r1 = t10pdiezmo % 10;
    t10pdiezmo += r1 > 0 ? 10 - r1 : 0;

    t3pnacional = (totalDiezmosMXN - t10pdiezmo + totalOfrendasMXN) * 0.03;
    let r2 = t3pnacional % 10;
    t3pnacional += r2 > 0 ? 10 - r2 : 0;

    let ingresoparcial = (totalDiezmosMXN - t10pdiezmo - t3pnacional + totalOfrendasMXN) / 2;
    totalfinalpastor = ingresoparcial;

    let IsLastSunday = false;
    if (IsSunday) {
        const nextSunday = new Date(dateObj);
        nextSunday.setUTCDate(dateObj.getUTCDate() + 7);
        IsLastSunday = nextSunday.getUTCMonth() !== dateObj.getUTCMonth();
    }
    
    if (IsSunday && ingresoparcial > 250) {
        totalfinalpastor += 250;
        ingresoparcial -= 250;
    }
    
    if (IsLastSunday && ingresoparcial > 250) {
        totalfinalpastor += 250;
    }
    
    let r4 = totalfinalpastor % 10;
    totalfinalpastor += r4 > 0 ? 10 - r4 : 0;

    t10pmisiones = (totalDiezmosMXN - t10pdiezmo - t3pnacional - totalfinalpastor + totalOfrendasMXN) * 0.10;
    let r5 = t10pmisiones % 10;
    t10pmisiones += r5 > 0 ? 10 - r5 : 0;

    t5peventos = (totalDiezmosMXN - t10pdiezmo - t3pnacional + totalOfrendasMXN - totalfinalpastor - t10pmisiones) * 0.05;
    let r6 = t5peventos % 10;
    t5peventos += r6 > 0 ? 10 - r6 : 0;
    
    ingreso = totalDiezmosMXN - t10pdiezmo - t3pnacional + totalOfrendasMXN - t10pmisiones - t5peventos - totalfinalpastor;
    
    if (ingreso >= 100 && IsSunday) {
        ingreso -= 100;
        aguinaldoPastor = 100;
    }
  } else {
    ingreso = 0;
  }

  // Descontar gastos registrados
  let gastosIngreso = 0;
  let gastosDiezmo = 0;
  let gastosNacional = 0;
  let gastosMisiones = 0;
  let gastosEventos = 0;
  let gastosPastor = 0;
  let gastosAguinaldo = 0;

  if (entrada.gastos) {
    entrada.gastos.forEach((g: any) => {
      if (g.cuenta === '10% Diezmo') gastosDiezmo += g.importe;
      else if (g.cuenta === '3% Viña Nacional') gastosNacional += g.importe;
      else if (g.cuenta === 'Misiones (10%)') gastosMisiones += g.importe;
      else if (g.cuenta === 'Eventos (5%)') gastosEventos += g.importe;
      else if (g.cuenta === 'Pastor') gastosPastor += g.importe;
      else if (g.cuenta === 'Aguinaldo Pastor') gastosAguinaldo += g.importe;
      else gastosIngreso += g.importe; // Cualquier otra cuenta afecta al fondo general (Ingreso)
    });
  }

  t10pdiezmo -= gastosDiezmo;
  t3pnacional -= gastosNacional;
  t10pmisiones -= gastosMisiones;
  t5peventos -= gastosEventos;
  totalfinalpastor -= gastosPastor;
  aguinaldoPastor -= gastosAguinaldo;
  ingreso -= gastosIngreso;

  const distVieja = {
    "10% Diezmo": t10pdiezmo,
    "3% Viña Nacional": t3pnacional,
    "Pastor": totalfinalpastor,
    "Misiones (10%)": t10pmisiones,
    "Eventos (5%)": t5peventos,
    "Aguinaldo Pastor": aguinaldoPastor,
    "Ingreso": ingreso
  };

  // SHADOW MODE
  try {
    const reglas = await prisma.reglaDistribucion.findMany();
    const distNueva = calcularDistribucionDinamica(totalDiezmosMXN, totalOfrendasMXN, dateObj, reglas);
    
    // Check if new matches old
    let mismatch = false;
    for (const key in distVieja) {
      if (key === "Ingreso" && (distVieja[key] === 0 && distNueva[key] === undefined)) continue; 
      // Compare net values...
    }
  } catch (e) {
    console.error("Shadow mode error:", e);
  }

  return distVieja;
}

export async function calcularSaldosActuales(prisma: PrismaClient) {
  // 1. Obtener último corte
  const ultimoCorte = await prisma.corte.findFirst({
    orderBy: { fecha: 'desc' },
    include: { registros: true }
  });

  const fechaInicio = ultimoCorte ? ultimoCorte.fecha : new Date(0);

  // 2. Inicializar cuentas con el saldo físico del último corte
  const saldos: SaldosCuenta = {
    "10% Diezmo": 0,
    "3% Viña Nacional": 0,
    "Misiones (10%)": 0,
    "Eventos (5%)": 0,
    "Aguinaldo Pastor": 0,
    "Ingreso": 0
  };

  if (ultimoCorte) {
    ultimoCorte.registros.forEach(r => {
      saldos[r.concepto] = r.saldoFisico;
    });
  }

  // 3. Sumar entradas posteriores al corte
  const entradas = await prisma.entrada.findMany({
    where: { fecha: { gt: fechaInicio } },
    include: {
      registros: {
        include: { otrosRubros: true }
      }
    }
  });

  for (const entrada of entradas) {
    const dist = await calcularDistribucion(entrada);
    for (const cuenta in dist) {
      if (saldos[cuenta] === undefined) saldos[cuenta] = 0;
      saldos[cuenta] += dist[cuenta as keyof typeof dist];
    }

    // Sumar otros rubros
    const toMXN = (importe: number, moneda: string) => {
      if (moneda === "USD") return importe * entrada.tipoCambio;
      return importe;
    };

    entrada.registros.forEach(r => {
      r.otrosRubros.forEach(o => {
        const importeMXN = toMXN(o.importe, o.moneda);
        if (saldos[o.tipo] === undefined) saldos[o.tipo] = 0;
        saldos[o.tipo] += importeMXN;
      });
    });
  }

  // 4. Restar gastos posteriores al corte (solo gastos generales fuera de entradas)
  const gastos = await prisma.gasto.findMany({
    where: { 
      fecha: { gt: fechaInicio },
      entradaId: null // Ignoramos los que tienen entradaId, pues ya se descontaron en la distribución
    }
  });

  gastos.forEach(gasto => {
    if (["10% Diezmo", "3% Viña Nacional", "Misiones (10%)", "Eventos (5%)", "Aguinaldo Pastor", "Ingreso"].includes(gasto.cuenta)) {
      if (saldos[gasto.cuenta] === undefined) saldos[gasto.cuenta] = 0;
      saldos[gasto.cuenta] -= gasto.importe;
    } else if (gasto.cuenta === "Misiones") {
      if (saldos["Misiones (10%)"] === undefined) saldos["Misiones (10%)"] = 0;
      saldos["Misiones (10%)"] -= gasto.importe;
    } else {
      // Gastos como Servicios, Mantenimiento, Sueldos, etc., se descuentan del Fondo General (Ingreso)
      if (saldos["Ingreso"] === undefined) saldos["Ingreso"] = 0;
      saldos["Ingreso"] -= gasto.importe;
    }
  });

  return saldos;
}

export async function validarFechaCorte(prisma: PrismaClient, fecha: Date) {
  const ultimoCorte = await prisma.corte.findFirst({
    orderBy: { fecha: 'desc' }
  });

  // Solo comparar la parte de la fecha, ignorando la hora
  const fechaOperacion = new Date(fecha.toISOString().split('T')[0]);
  
  if (ultimoCorte) {
    const fechaCorte = new Date(ultimoCorte.fecha.toISOString().split('T')[0]);
    if (fechaOperacion <= fechaCorte) {
      throw new Error(`La fecha del registro no puede ser igual o anterior a la fecha del último corte (${fechaCorte.toLocaleDateString()}).`);
    }
  }
}

export async function sincronizarIngresoMongo(prisma: PrismaClient, entradaId: string) {
  const entrada = await prisma.entrada.findUnique({
    where: { id: entradaId },
    include: { registros: true, gastos: true }
  });

  if (entrada) {
    const dist = await calcularDistribucion(entrada);
    await prisma.entrada.update({
      where: { id: entradaId },
      data: { ingreso: dist.Ingreso }
    });
  }
}
