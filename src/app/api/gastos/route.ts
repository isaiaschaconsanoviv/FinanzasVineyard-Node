import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { validarFechaCorte, sincronizarIngresoMongo } from "@/lib/balances";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const gastos = await prisma.gasto.findMany({
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json(gastos);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener gastos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { fecha, cuenta, concepto, importe, elaboradoPor, entradaId, comprobanteUrl, pagado } = body;

    const nombreUsuario = elaboradoPor || (session.user as any)?.nombre || session.user?.name || "Administrador";

    if (!cuenta || !concepto || importe === undefined) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const parsedDate = fecha ? new Date(fecha) : new Date();

    try {
      await validarFechaCorte(prisma, parsedDate);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const nuevoGasto = await prisma.gasto.create({
      data: {
        fecha: parsedDate,
        cuenta,
        concepto,
        importe: parseFloat(importe),
        elaboradoPor: nombreUsuario,
        comprobanteUrl: comprobanteUrl || null,
        pagado: pagado !== undefined ? Boolean(pagado) : true,
        ...(entradaId ? { entradaId } : {})
      }
    });

    if (entradaId) {
      await sincronizarIngresoMongo(prisma, entradaId);
    }

    return NextResponse.json(nuevoGasto, { status: 201 });
  } catch (error: any) {
    console.error("Error Gasto:", error);
    return NextResponse.json({ error: error.message || "Error al registrar el gasto" }, { status: 500 });
  }
}
