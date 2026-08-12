import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    // Buscar usuario con el token y verificar que no haya expirado
    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // El token debe expirar en el futuro (mayor a ahora)
        }
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: "El enlace es inválido o ha expirado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña, activar usuario por si acaso, y limpiar tokens
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: hashedPassword,
        activo: true,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    return NextResponse.json({ message: "Contraseña establecida exitosamente" });
  } catch (error: any) {
    console.error("Error en setup-password:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
