import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any)?.rol === "READONLY") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
    }

    const data = await req.json();
    if (!data.promesaId || !data.cantidad || !data.moneda) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const aportacion = await prisma.aportacionPromesa.create({
      data: {
        promesaId: data.promesaId,
        cantidad: parseFloat(data.cantidad),
        moneda: data.moneda, // "MXN" o "USD"
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        entradaId: data.entradaId || null
      }
    });

    return NextResponse.json(aportacion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
