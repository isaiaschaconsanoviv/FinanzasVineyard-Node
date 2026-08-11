import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { validarFechaCorte, sincronizarIngresoMongo } from "@/lib/balances";

const prisma = new PrismaClient();

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { nombre, diezmo, monedaDiezmo, ofrenda, monedaOfrenda, otros } = body;

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const nuevoRegistro = await prisma.registro.create({
      data: {
        entradaId: params.id,
        nombre,
        diezmo: parseFloat(diezmo || 0),
        monedaDiezmo: monedaDiezmo || "MXN",
        ofrenda: parseFloat(ofrenda || 0),
        monedaOfrenda: monedaOfrenda || "MXN",
        otrosRubros: {
          create: otros && otros.length > 0 ? otros.map((o: any) => ({
            tipo: o.tipo,
            importe: parseFloat(o.importe || 0),
            moneda: o.moneda || "MXN"
          })) : []
        }
      },
      include: {
        otrosRubros: true
      }
    });

    await sincronizarIngresoMongo(prisma, params.id);

    return NextResponse.json(nuevoRegistro, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al registrar donante" }, { status: 500 });
  }
}
