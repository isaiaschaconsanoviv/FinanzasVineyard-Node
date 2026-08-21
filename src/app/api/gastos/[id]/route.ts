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

function extractCloudinaryDetails(url: string) {
  try {
    let type = "upload";
    let split = url.split('/upload/');
    if (split.length < 2) {
      split = url.split('/authenticated/');
      if (split.length >= 2) {
        type = "authenticated";
      } else {
        return null;
      }
    }

    const preParts = split[0].split('/');
    const resourceType = preParts[preParts.length - 1];

    let path = decodeURIComponent(split[1]);
    path = path.replace(/^s--[\w-]+--\//, '');
    if (path.match(/^v\d+\//)) {
      path = path.replace(/^v\d+\//, '');
    }
    const lastDotIndex = path.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 ? path.substring(0, lastDotIndex) : path;
    
    return { publicId, resourceType, type };
  } catch {
    return null;
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.rol === "READONLY") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { cuenta, concepto, importe, pagado } = body;

    const gastoExistente = await prisma.gasto.findUnique({ where: { id } });
    if (!gastoExistente) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    if ((session.user as any)?.rol === "GASTOS" && gastoExistente.elaboradoPor !== (session.user as any)?.name) {
      return NextResponse.json({ error: "Prohibido: Solo puedes modificar tus propios gastos" }, { status: 403 });
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
    if (!session || (session.user as any)?.rol === "READONLY") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = params;

    const gastoExistente = await prisma.gasto.findUnique({ where: { id } });
    if (!gastoExistente) {
      return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
    }

    if ((session.user as any)?.rol === "GASTOS" && gastoExistente.elaboradoPor !== (session.user as any)?.name) {
      return NextResponse.json({ error: "Prohibido: Solo puedes eliminar tus propios gastos" }, { status: 403 });
    }

    try {
      await validarFechaCorte(prisma, gastoExistente.fecha);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    if (gastoExistente.comprobanteUrl) {
      const details = extractCloudinaryDetails(gastoExistente.comprobanteUrl);
      if (details) {
        await cloudinary.uploader.destroy(details.publicId, {
          resource_type: details.resourceType,
          type: details.type
        }).catch(console.error);
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
