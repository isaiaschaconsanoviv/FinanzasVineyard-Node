import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { calcularSaldosActuales } from "@/lib/balances";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const saldos = await calcularSaldosActuales(prisma);

    return NextResponse.json(saldos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al calcular saldos" }, { status: 500 });
  }
}
