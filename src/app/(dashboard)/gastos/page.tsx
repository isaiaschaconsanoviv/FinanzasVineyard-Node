import { PrismaClient } from "@prisma/client";
import GastosClient from "./GastosClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function GastosPage() {
  const session = await getServerSession(authOptions);

  const gastos = await prisma.gasto.findMany({
    orderBy: { fecha: 'desc' }
  });

  const total = gastos.reduce((sum, g) => sum + g.importe, 0);

  return (
    <div className="animate-fade-in">
      <GastosClient gastos={gastos} total={total} session={session} />
    </div>
  );
}
