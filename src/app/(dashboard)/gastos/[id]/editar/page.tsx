import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import EditGastoForm from "./EditGastoForm";

const prisma = new PrismaClient();

export default async function EditGastoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gasto = await prisma.gasto.findUnique({
    where: { id: params.id }
  });

  if (!gasto) {
    notFound();
  }

  // Convert dates and parse strictly for Client Component
  const serializableGasto = JSON.parse(JSON.stringify(gasto));

  return <EditGastoForm gasto={serializableGasto} />;
}
