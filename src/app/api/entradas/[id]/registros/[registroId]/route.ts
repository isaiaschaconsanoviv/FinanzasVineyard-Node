import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { validarFechaCorte, sincronizarIngresoMongo } from "@/lib/balances";

const prisma = new PrismaClient();

export async function DELETE(req: Request, props: { params: Promise<{ id: string, registroId: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    await prisma.registro.delete({
      where: { id: params.registroId }
    });

    await sincronizarIngresoMongo(prisma, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar registro" }, { status: 500 });
  }
}
