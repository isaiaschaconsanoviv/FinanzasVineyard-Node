const { PrismaClient } = require('@prisma/client');
const { calcularDistribucion } = require('./src/lib/balances.ts');

const prisma = new PrismaClient();

async function main() {
  const { calcularDistribucion } = await import('./src/lib/balances');
  
  const entradas = await prisma.entrada.findMany({
    include: { registros: true, gastos: true }
  });
  
  for (const entrada of entradas) {
    const dist = calcularDistribucion(entrada);
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
}).finally(() => {
  prisma.$disconnect();
});
