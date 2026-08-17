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

export async function PATCH(req: Request, props: { params: Promise<{ id: string, registroId: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { nombre, diezmo, monedaDiezmo, ofrenda, monedaOfrenda, otros } = body;

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const registroActualizado = await prisma.registro.update({
      where: { id: params.registroId },
      data: {
        nombre,
        diezmo: parseFloat(diezmo || 0),
        monedaDiezmo: monedaDiezmo || "MXN",
        ofrenda: parseFloat(ofrenda || 0),
        monedaOfrenda: monedaOfrenda || "MXN",
        otrosRubros: {
          deleteMany: {},
          create: otros && otros.length > 0 ? otros.map((o: any) => ({
            tipo: o.tipo,
            importe: parseFloat(o.importe || 0),
            moneda: o.moneda || "MXN"
          })) : []
        }
      },
      include: {
        otrosRubros: true
      }
    });

    await sincronizarIngresoMongo(prisma, params.id);

    return NextResponse.json(registroActualizado);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar registro" }, { status: 500 });
  }
}
