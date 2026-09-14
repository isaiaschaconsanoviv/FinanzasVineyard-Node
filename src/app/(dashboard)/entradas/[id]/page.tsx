import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import EntradaDetalle from "./EntradaDetalle";

const prisma = new PrismaClient();

export default async function EntradaDetallePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const entrada = await prisma.entrada.findUnique({
    where: { id: params.id },
    include: {
      gastos: true,
      registros: {
        include: { otrosRubros: true }
      }
    }
  });

  if (!entrada) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isReadOnly = (session?.user as any)?.rol === "READONLY";

  // Convert dates and parse strictly for Client Component
  const serializableEntrada = JSON.parse(JSON.stringify(entrada));

  return <EntradaDetalle entrada={serializableEntrada} isReadOnly={isReadOnly} />;
}
