import { PrismaClient } from '@prisma/client';
import { calcularDistribucion } from './src/lib/balances';

const prisma = new PrismaClient();

async function main() {
  const entradas = await prisma.entrada.findMany({
    include: { registros: true, gastos: true }
  });
  
  for (const entrada of entradas) {
    const dist = await calcularDistribucion(entrada);
    await prisma.entrada.update({
      where: { id: entrada.id },
      data: { ingreso: dist.Ingreso }
    });
    console.log(`Entrada ${entrada.id} actualizada con ingreso: ${dist.Ingreso}`);
  }
  
  console.log("Sincronización completa.");
}

main().catch(e => {
  console.error(e);
}).finally(async () => {
  await prisma.$disconnect();
});
