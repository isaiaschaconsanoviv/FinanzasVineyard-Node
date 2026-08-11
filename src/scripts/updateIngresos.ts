import { PrismaClient } from '@prisma/client';
import { calcularDistribucion } from '../lib/balances';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando actualización de ingreso en Entradas...");
  
  const entradas = await prisma.entrada.findMany({
    include: {
      registros: {
        include: {
          otrosRubros: true
        }
      }
    }
  });

  for (const entrada of entradas) {
    const dist = await calcularDistribucion(entrada);
    const ingresoNeto = dist["Ingreso"] || 0;
    
    await prisma.entrada.update({
      where: { id: entrada.id },
      data: { ingreso: dist["Ingreso"] }
    });
    console.log(`Entrada ${entrada.id}: Ingreso actualizado a ${ingresoNeto}`);
  }
  
  console.log("Completado.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
