import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const cortes = await prisma.corte.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        registros: true
      }
    });

    return NextResponse.json(cortes);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener cortes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { notas, registros } = body;

    const nombreUsuario = (session.user as any)?.nombre || session.user?.name || "Administrador";

    if (!registros || registros.length === 0) {
      return NextResponse.json({ error: "El corte debe tener al menos un registro de saldo." }, { status: 400 });
    }

    const nuevoCorte = await prisma.corte.create({
      data: {
        notas,
        elaboradoPor: nombreUsuario,
        registros: {
          create: registros.map((r: any) => ({
            concepto: r.concepto,
            saldoFisico: parseFloat(r.saldoFisico || 0),
            saldoSistema: parseFloat(r.saldoSistema || 0),
            diferencia: parseFloat(r.diferencia || 0)
          }))
        }
      },
      include: {
        registros: true
      }
    });

    return NextResponse.json(nuevoCorte, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al generar el corte" }, { status: 500 });
  }
}
