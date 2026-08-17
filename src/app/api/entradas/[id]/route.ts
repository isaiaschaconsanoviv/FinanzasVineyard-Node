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

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const entrada = await prisma.entrada.findUnique({
      where: { id: params.id },
      include: {
        registros: {
          include: {
            otrosRubros: true
          }
        }
      }
    });

    if (!entrada) return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });

    return NextResponse.json(entrada);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener la entrada" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).rol !== "ADMIN" && (session.user as any).rol !== "STAFF")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const entrada = await prisma.entrada.findUnique({ where: { id: params.id }});
    if (entrada) {
      try {
        await validarFechaCorte(prisma, entrada.fecha);
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    }

    // Eliminar manualmente los hijos que no tienen Cascade
    const registros = await prisma.registro.findMany({ where: { entradaId: params.id } });
    for (const reg of registros) {
      await prisma.otroRubro.deleteMany({ where: { registroId: reg.id } });
    }
    await prisma.registro.deleteMany({ where: { entradaId: params.id } });
    
    // Gastos tiene onDelete: Cascade, pero por seguridad en MongoDB lo borramos explícitamente
    // Adicionalmente borramos sus tickets de Cloudinary si existen
    const gastos = await prisma.gasto.findMany({ where: { entradaId: params.id } });
    for (const gasto of gastos) {
      if (gasto.comprobanteUrl) {
        const publicId = extractPublicId(gasto.comprobanteUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId).catch(console.error);
        }
      }
    }
    await prisma.gasto.deleteMany({ where: { entradaId: params.id } });

    await prisma.entrada.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar la entrada" }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    
    const entrada = await prisma.entrada.findUnique({ where: { id: params.id }});
    if (entrada) {
      try {
        await validarFechaCorte(prisma, entrada.fecha);
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    }

    const updatedEntrada = await prisma.entrada.update({
      where: { id: params.id },
      data: {
        tipoCambio: body.tipoCambio !== undefined ? parseFloat(body.tipoCambio) : undefined,
      }
    });

    await sincronizarIngresoMongo(prisma, params.id);

    return NextResponse.json(updatedEntrada);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar la entrada" }, { status: 500 });
  }
}
