import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cuentas = await prisma.cuentaPersonalizada.findMany({
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(cuentas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.nombre || data.nombre.trim() === '') {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const cuenta = await prisma.cuentaPersonalizada.create({
      data: {
        nombre: data.nombre.trim(),
        activa: data.activa !== undefined ? data.activa : true
      }
    });

    return NextResponse.json(cuenta);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese nombre' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
