import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UsuariosClient from "./UsuariosClient";

const prisma = new PrismaClient();

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);
  
  const usuarios = await prisma.usuario.findMany({
    orderBy: { nombre: 'asc' }
  });

  return <UsuariosClient usuarios={usuarios} session={session} />;
}
