import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const reglas = await prisma.reglaDistribucion.findMany({
      orderBy: { ordenVisual: 'asc' }
    });
    return NextResponse.json(reglas);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener reglas" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID de regla requerido" }, { status: 400 });
    }

    const updated = await prisma.reglaDistribucion.update({
      where: { id },
      data
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar regla" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const nueva = await prisma.reglaDistribucion.create({ data });
    return NextResponse.json(nueva);
  } catch (error) {
    return NextResponse.json({ error: "Error al crear regla" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    
    await prisma.reglaDistribucion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar regla" }, { status: 500 });
  }
}
