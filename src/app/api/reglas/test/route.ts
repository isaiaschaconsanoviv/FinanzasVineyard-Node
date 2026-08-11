import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calcularDistribucionDinamica } from "@/lib/reglasEngine";
import { calcularDistribucion } from "@/lib/balances";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const reglas = await prisma.reglaDistribucion.findMany({
      orderBy: { orden: 'asc' }
    });

    const entradas = await prisma.entrada.findMany({
      orderBy: { fecha: 'desc' },
      take: 10,
      include: { registros: { include: { otrosRubros: true } } }
    });

    const resultados = [];

    for (const entrada of entradas) {
      // Cálculo Viejo (llamamos a calcularDistribucion, que por dentro ahora es async y devuelve el viejo)
      // Pero para no hacer doble llamada a la BD, mejor re-calculamos aquí el viejo o simplemente usamos el resultado de calcularDistribucion.
      // Wait, calcularDistribucion(entrada) already runs both and logs to console, but returns the OLD distribution.
      const distVieja = await calcularDistribucion(entrada);

      // Cálculo Nuevo
      let totalDiezmos = 0;
      let totalOfrendas = 0;
      entrada.registros.forEach((r: any) => {
        totalDiezmos += r.monedaDiezmo === "USD" ? r.diezmo * entrada.tipoCambio : r.diezmo;
        totalOfrendas += r.monedaOfrenda === "USD" ? r.ofrenda * entrada.tipoCambio : r.ofrenda;
      });
      const fechaObj = new Date(entrada.fecha);
      const distNueva = calcularDistribucionDinamica(totalDiezmos, totalOfrendas, fechaObj, reglas);

      resultados.push({
        id: entrada.id,
        fecha: entrada.fecha,
        totales: { diezmos: totalDiezmos, ofrendas: totalOfrendas },
        viejo: distVieja,
        nuevo: distNueva
      });
    }

    return NextResponse.json({ reglas, resultados });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al verificar" }, { status: 500 });
  }
}
