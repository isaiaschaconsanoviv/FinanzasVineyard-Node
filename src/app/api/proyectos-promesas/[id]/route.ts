import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const proyecto = await prisma.proyectoPromesa.findUnique({
      where: { id },
      include: {
        promesas: {
          include: {
            aportaciones: true
          }
        },
        cuenta: true
      }
    });

    if (!proyecto) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(proyecto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const updateData: any = {};

    if (data.nombre) updateData.nombre = data.nombre.trim();
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.fechaInicio) updateData.fechaInicio = new Date(data.fechaInicio);
    if (data.fechaFinTentativa !== undefined) updateData.fechaFinTentativa = data.fechaFinTentativa ? new Date(data.fechaFinTentativa) : null;
    if (data.meta !== undefined) updateData.meta = data.meta ? parseFloat(data.meta) : null;
    if (data.activo !== undefined) updateData.activo = data.activo;

    const proyecto = await prisma.proyectoPromesa.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(proyecto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const proyecto = await prisma.proyectoPromesa.delete({
      where: { id }
    });
    return NextResponse.json(proyecto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
