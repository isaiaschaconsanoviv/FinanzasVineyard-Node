import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando reglas existentes...");
  await prisma.reglaDistribucion.deleteMany({});

  console.log("Insertando reglas base...");

  await prisma.reglaDistribucion.createMany({
    data: [
      {
        nombre: "10% Diezmo",
        tipo: "PERCENTAGE",
        valor: 10.0,
        orden: 1,
        ordenVisual: 2,
        baseDeCalculo: "BRUTO_DIEZMOS", 
        redondeoDiez: true,
        activo: true
      },
      {
        nombre: "3% Viña Nacional",
        tipo: "PERCENTAGE",
        valor: 3.0,
        orden: 2,
        ordenVisual: 3,
        baseDeCalculo: "REMANENTE",
        redondeoDiez: true,
        activo: true
      },
      // Pastor is calculated here in the old engine, but it's not a "fondo" that accumulates, it's just a deduction. 
      // The old engine calculates 50%, adds Sunday bonuses, rounds, and deducts it.
      // We will add a "Pastor" rule, but we need to tell TestSombraModal to ignore it in the "viejo" comparison since it's not returned.
      {
        nombre: "Pastor",
        tipo: "PERCENTAGE",
        valor: 50.0,
        orden: 3,
        ordenVisual: 4,
        baseDeCalculo: "REMANENTE",
        redondeoDiez: true,
        // Actually, the new engine doesn't know how to add $250 for Sundays automatically.
        // We might need to handle Pastor separately, or accept a slight difference on Sundays.
        // Let's seed it normally and update the engine to handle it.
        activo: true
      },
      {
        nombre: "Bono Pastor Domingo",
        tipo: "FIXED",
        valor: 250.0,
        orden: 4,
        ordenVisual: 99, // Hide or put at bottom
        baseDeCalculo: "REMANENTE",
        redondeoDiez: false,
        condicionDia: "SUNDAY",
        activo: true
      },
      {
        nombre: "Bono Pastor Ultimo Domingo",
        tipo: "FIXED",
        valor: 250.0,
        orden: 5,
        ordenVisual: 100, // Hide or put at bottom
        baseDeCalculo: "REMANENTE",
        redondeoDiez: false,
        condicionDia: "LAST_SUNDAY",
        activo: true
      },
      {
        nombre: "Misiones (10%)",
        tipo: "PERCENTAGE",
        valor: 10.0,
        orden: 6,
        ordenVisual: 5,
        baseDeCalculo: "REMANENTE",
        redondeoDiez: true,
        activo: true
      },
      {
        nombre: "Eventos (5%)",
        tipo: "PERCENTAGE",
        valor: 5.0,
        orden: 7,
        ordenVisual: 6,
        baseDeCalculo: "REMANENTE",
        redondeoDiez: true,
        activo: true
      },
      // Aguinaldo is taken at the very end in the old engine.
      {
        nombre: "Aguinaldo Pastor",
        tipo: "FIXED",
        valor: 100.0,
        orden: 8,
        ordenVisual: 1,
        baseDeCalculo: "REMANENTE",
        redondeoDiez: false,
        condicionDia: "SUNDAY",
        condicionMinimo: 100.0, // Solo si el Ingreso es >= 100
        activo: true
      }
    ]
  });

  console.log("Seed completado exitosamente.");
}

main().catch(e => {
  console.error(e);
}).finally(async () => {
  await prisma.$disconnect();
});
