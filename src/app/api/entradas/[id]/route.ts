import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { validarFechaCorte, sincronizarIngresoMongo } from "@/lib/balances";

const prisma = new PrismaClient();

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const entrada = await prisma.entrada.findUnique({
      where: { id: params.id },
      include: {
        registros: {
          include: {
            otrosRubros: true
          }
        }
      }
    });

    if (!entrada) return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });

    return NextResponse.json(entrada);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener la entrada" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "ADMIN") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const entrada = await prisma.entrada.findUnique({ where: { id: params.id }});
    if (entrada) {
      try {
        await validarFechaCorte(prisma, entrada.fecha);
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    }

    await prisma.entrada.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar la entrada" }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    
    const entrada = await prisma.entrada.findUnique({ where: { id: params.id }});
    if (entrada) {
      try {
        await validarFechaCorte(prisma, entrada.fecha);
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    }

    const updatedEntrada = await prisma.entrada.update({
      where: { id: params.id },
      data: {
        tipoCambio: body.tipoCambio !== undefined ? parseFloat(body.tipoCambio) : undefined,
      }
    });

    await sincronizarIngresoMongo(prisma, params.id);

    return NextResponse.json(updatedEntrada);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar la entrada" }, { status: 500 });
  }
}
