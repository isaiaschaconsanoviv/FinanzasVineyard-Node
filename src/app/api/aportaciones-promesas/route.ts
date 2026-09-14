import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
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
