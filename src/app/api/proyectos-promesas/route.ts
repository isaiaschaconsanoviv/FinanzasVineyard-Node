import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const proyectos = await prisma.proyectoPromesa.findMany({
      orderBy: { fechaInicio: 'desc' },
      include: {
        promesas: {
          include: {
            aportaciones: true
          }
        },
        cuenta: true
      }
    });
    return NextResponse.json(proyectos);
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

    const nombreProyecto = data.nombre.trim();

    // 1. Buscar o crear la cuenta personalizada asociada
    let cuenta = await prisma.cuentaPersonalizada.findUnique({
      where: { nombre: nombreProyecto }
    });

    if (!cuenta) {
      cuenta = await prisma.cuentaPersonalizada.create({
        data: {
          nombre: nombreProyecto,
          activa: true
        }
      });
    }

    // 2. Crear el proyecto
    const proyecto = await prisma.proyectoPromesa.create({
      data: {
        nombre: nombreProyecto,
        descripcion: data.descripcion || null,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : new Date(),
        fechaFinTentativa: data.fechaFinTentativa ? new Date(data.fechaFinTentativa) : null,
        meta: data.meta ? parseFloat(data.meta) : null,
        activo: data.activo !== undefined ? data.activo : true,
        cuentaId: cuenta.id
      }
    });

    return NextResponse.json(proyecto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
