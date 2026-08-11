import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { validarFechaCorte, sincronizarIngresoMongo } from "@/lib/balances";

const prisma = new PrismaClient();

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { cuenta, concepto, importe } = body;

    const gastoExistente = await prisma.gasto.findUnique({ where: { id } });
    if (!gastoExistente) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    try {
      await validarFechaCorte(prisma, gastoExistente.fecha);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const gastoActualizado = await prisma.gasto.update({
      where: { id },
      data: {
        ...(cuenta ? { cuenta } : {}),
        ...(concepto ? { concepto } : {}),
        ...(importe !== undefined ? { importe: parseFloat(importe) } : {}),
      }
    });

    if (gastoExistente.entradaId) {
      await sincronizarIngresoMongo(prisma, gastoExistente.entradaId);
    }

    return NextResponse.json(gastoActualizado);
  } catch (error: any) {
    console.error("Error actualizando gasto:", error);
    return NextResponse.json({ error: "Error al actualizar el gasto" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    const gastoExistente = await prisma.gasto.findUnique({ where: { id } });
    if (!gastoExistente) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    try {
      await validarFechaCorte(prisma, gastoExistente.fecha);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    await prisma.gasto.delete({ where: { id } });

    if (gastoExistente.entradaId) {
      await sincronizarIngresoMongo(prisma, gastoExistente.entradaId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error eliminando gasto:", error);
    return NextResponse.json({ error: "Error al eliminar el gasto" }, { status: 500 });
  }
}
