import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { validarFechaCorte } from "@/lib/balances";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const entradas = await prisma.entrada.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        registros: {
          include: {
            otrosRubros: true
          }
        }
      }
    });

    return NextResponse.json(entradas);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener entradas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { fecha, tipoCambio, notas, elaboradoPor } = body;

    if (!tipoCambio || !elaboradoPor) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const parsedDate = fecha ? new Date(fecha) : new Date();

    try {
      await validarFechaCorte(prisma, parsedDate);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const nuevaEntrada = await prisma.entrada.create({
      data: {
        fecha: parsedDate,
        tipoCambio: parseFloat(tipoCambio),
        notas: notas || "",
        elaboradoPor,
      }
    });

    return NextResponse.json(nuevaEntrada, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear entrada" }, { status: 500 });
  }
}
