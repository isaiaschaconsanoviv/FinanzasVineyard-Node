import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any)?.rol === "READONLY") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
    }

    const { id } = await params;
    const aportacion = await prisma.aportacionPromesa.delete({
      where: { id }
    });
    return NextResponse.json(aportacion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any)?.rol === "READONLY") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    const aportacion = await prisma.aportacionPromesa.update({
      where: { id },
      data: {
        cantidad: data.cantidad !== undefined ? parseFloat(data.cantidad) : undefined,
        moneda: data.moneda,
        fecha: data.fecha ? new Date(data.fecha) : undefined,
        ...(data.comprobante !== undefined && { comprobante: data.comprobante })
      }
    });

    return NextResponse.json(aportacion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
