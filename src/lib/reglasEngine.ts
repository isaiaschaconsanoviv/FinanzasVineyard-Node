import { ReglaDistribucion } from "@prisma/client";
import { Registro } from "@prisma/client";

export function calcularDistribucionDinamica(
  totalDiezmosMXN: number,
  totalOfrendasMXN: number,
  fecha: Date,
  reglas: ReglaDistribucion[]
): Record<string, number> {
  const result: Record<string, number> = {};
  
  // Sort rules by order
  const reglasOrdenadas = [...reglas].sort((a, b) => a.orden - b.orden);
  
  // Initialize running state
  let remanenteActual = totalDiezmosMXN + totalOfrendasMXN;
  let diezmosRestantes = totalDiezmosMXN;
  let totalDistribucion = 0; // Total money allocated to specific funds

  for (const regla of reglasOrdenadas) {
    if (!regla.activo) continue;

    // Check conditions
    const isSunday = fecha.getUTCDay() === 0;
    
    let isLastSunday = false;
    if (isSunday) {
        const nextSunday = new Date(fecha);
        nextSunday.setUTCDate(fecha.getUTCDate() + 7);
        isLastSunday = nextSunday.getUTCMonth() !== fecha.getUTCMonth();
    }

    if (regla.condicionDia === "SUNDAY" && !isSunday) continue;
    if (regla.condicionDia === "LAST_SUNDAY" && !isLastSunday) continue;
    
    // Check minimum requirement
    if (regla.condicionMinimo && regla.condicionMinimo > 0) {
      if (remanenteActual < regla.condicionMinimo) {
        continue;
      }
    }

    let baseCalculo = 0;
    if (regla.baseDeCalculo === "BRUTO_DIEZMOS") {
      baseCalculo = totalDiezmosMXN;
    } else if (regla.baseDeCalculo === "REMANENTE") {
      baseCalculo = remanenteActual;
    } else if (regla.baseDeCalculo === "BRUTO_TOTAL") {
      baseCalculo = totalDiezmosMXN + totalOfrendasMXN;
    }

    let monto = 0;

    if (regla.tipo === "FIXED") {
      monto = regla.valor;
    } else if (regla.tipo === "PERCENTAGE") {
      monto = baseCalculo * (regla.valor / 100);
    }

    // Apply rounding to next 10 if required
    if (regla.redondeoDiez) {
      const r = monto % 10;
      if (r > 0) {
        monto += (10 - r);
      }
    }

    // Save calculation
    result[regla.nombre] = monto;
    
    // Deduct from remainders
    if (regla.baseDeCalculo === "BRUTO_DIEZMOS") {
      diezmosRestantes -= monto;
    }
    remanenteActual -= monto;
    
    totalDistribucion += monto;
  }

  // Whatever is left goes to Ingreso (Fondo General)
  const ingresoNeto = remanenteActual;
  result["Ingreso"] = ingresoNeto > 0 ? ingresoNeto : 0;

  return result;
}
