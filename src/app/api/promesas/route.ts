import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.proyectoId || !data.persona) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const promesa = await prisma.promesa.create({
      data: {
        proyectoId: data.proyectoId,
        persona: data.persona.trim(),
        cantidadMXN: data.cantidadMXN ? parseFloat(data.cantidadMXN) : 0,
        cantidadUSD: data.cantidadUSD ? parseFloat(data.cantidadUSD) : 0,
        fechaLimite: data.fechaLimite ? new Date(data.fechaLimite) : null,
        notas: data.notas || null
      }
    });

    return NextResponse.json(promesa);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
