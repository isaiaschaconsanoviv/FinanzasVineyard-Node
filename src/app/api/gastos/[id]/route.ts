import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { validarFechaCorte, sincronizarIngresoMongo } from "@/lib/balances";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

function extractPublicId(url: string) {
  try {
    const split = url.split('/upload/');
    if (split.length < 2) return null;
    let path = split[1];
    if (path.match(/^v\d+\//)) {
      path = path.replace(/^v\d+\//, '');
    }
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      path = path.substring(0, lastDotIndex);
    }
    return path;
  } catch {
    return null;
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { cuenta, concepto, importe, pagado } = body;

    const gastoExistente = await prisma.gasto.findUnique({ where: { id } });
    if (!gastoExistente) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    try {
      await validarFechaCorte(prisma, gastoExistente.fecha);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const gastoActualizado = await prisma.gasto.update({
      where: { id },
      data: {
        ...(cuenta ? { cuenta } : {}),
        ...(concepto ? { concepto } : {}),
        ...(importe !== undefined ? { importe: parseFloat(importe) } : {}),
        ...(pagado !== undefined ? { pagado: Boolean(pagado) } : {}),
      }
    });

    if (gastoExistente.entradaId) {
      await sincronizarIngresoMongo(prisma, gastoExistente.entradaId);
    }

    return NextResponse.json(gastoActualizado);
  } catch (error: any) {
    console.error("Error actualizando gasto:", error);
    return NextResponse.json({ error: "Error al actualizar el gasto" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    const gastoExistente = await prisma.gasto.findUnique({ where: { id } });
    if (!gastoExistente) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    try {
      await validarFechaCorte(prisma, gastoExistente.fecha);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    if (gastoExistente.comprobanteUrl) {
      const publicId = extractPublicId(gastoExistente.comprobanteUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch(console.error);
      }
    }

    await prisma.gasto.delete({ where: { id } });

    if (gastoExistente.entradaId) {
      await sincronizarIngresoMongo(prisma, gastoExistente.entradaId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error eliminando gasto:", error);
    return NextResponse.json({ error: "Error al eliminar el gasto" }, { status: 500 });
  }
}
