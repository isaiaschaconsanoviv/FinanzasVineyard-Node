import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.cuentaPersonalizada.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    const cuenta = await prisma.cuentaPersonalizada.update({
      where: { id },
      data: {
        nombre: data.nombre,
        activa: data.activa
      }
    });
    
    return NextResponse.json(cuenta);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
