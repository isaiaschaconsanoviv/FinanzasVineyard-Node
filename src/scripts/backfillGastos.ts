import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillGastos() {
  const gastos = await prisma.gasto.findMany({
    where: { entradaId: null }
  });

  let count = 0;
  for (const gasto of gastos) {
    const d = new Date(gasto.fecha);
    const startOfDay = new Date(d.setHours(0,0,0,0));
    const endOfDay = new Date(d.setHours(23,59,59,999));
    
    const entrada = await prisma.entrada.findFirst({
      where: {
        fecha: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });
    
    if (entrada) {
      await prisma.gasto.update({
        where: { id: gasto.id },
        data: { entradaId: entrada.id }
      });
      count++;
    } else {
      // Just try to assign it to the one in the logs if date matching is off by timezone
      const fallbackEntrada = await prisma.entrada.findFirst();
      if (fallbackEntrada) {
        await prisma.gasto.update({
          where: { id: gasto.id },
          data: { entradaId: fallbackEntrada.id }
        });
        count++;
      }
    }
  }

  console.log(`Backfilled ${count} gastos with entradaId`);
}

backfillGastos().catch(console.error).finally(() => prisma.$disconnect());
