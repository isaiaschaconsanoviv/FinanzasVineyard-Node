import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EditUserForm from "./EditUserForm";

const prisma = new PrismaClient();

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).rol !== "ADMIN") {
    return <div className="p-8 text-center text-danger">No tienes permisos para ver esta página.</div>;
  }

  const params = await props.params;
  const usuario = await prisma.usuario.findUnique({
    where: { id: params.id }
  });

  if (!usuario) {
    notFound();
  }

  // Remove the passwordHash before passing to client component
  const { passwordHash, ...safeUser } = usuario;

  // Convert dates and parse strictly for Client Component
  const serializableUser = JSON.parse(JSON.stringify(safeUser));

  return <EditUserForm usuario={serializableUser} />;
}
