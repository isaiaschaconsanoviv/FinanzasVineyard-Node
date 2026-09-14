import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const promesa = await prisma.promesa.findUnique({
      where: { id },
      include: {
        aportaciones: true
      }
    });

    if (!promesa) {
      return NextResponse.json({ error: 'Promesa no encontrada' }, { status: 404 });
    }

    return NextResponse.json(promesa);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const updateData: any = {};

    if (data.persona) updateData.persona = data.persona.trim();
    if (data.cantidadMXN !== undefined) updateData.cantidadMXN = data.cantidadMXN ? parseFloat(data.cantidadMXN) : 0;
    if (data.cantidadUSD !== undefined) updateData.cantidadUSD = data.cantidadUSD ? parseFloat(data.cantidadUSD) : 0;
    if (data.fechaLimite !== undefined) updateData.fechaLimite = data.fechaLimite ? new Date(data.fechaLimite) : null;
    if (data.notas !== undefined) updateData.notas = data.notas;

    const promesa = await prisma.promesa.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(promesa);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const promesa = await prisma.promesa.delete({
      where: { id }
    });
    return NextResponse.json(promesa);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
