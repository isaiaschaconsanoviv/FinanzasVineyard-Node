import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { enviarCorreo } from "@/lib/email";
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";
import * as React from "react";

const prisma = new PrismaClient();

import crypto from "crypto";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const params = await props.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id }
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (!usuario.correo) {
      return NextResponse.json({ error: "El usuario no tiene un correo electrónico configurado" }, { status: 400 });
    }

    // Generar nuevo token y actualizar
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.usuario.update({
      where: { id: params.id },
      data: { resetToken, resetTokenExpiry }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://finanzas-vineyard.vercel.app";
    const setupLink = `${appUrl}/setup-password?token=${resetToken}`;

    // Enviar correo de reset de contraseña
    const { error } = await enviarCorreo({
      to: usuario.correo,
      subject: "Restablecimiento de Contraseña - Finanzas Vineyard",
      react: React.createElement(ResetPasswordEmail, {
        nombre: usuario.nombre || "",
        usuario: usuario.usuario,
        setupLink,
      }),
    });

    if (error) {
      return NextResponse.json({ error: "Error al enviar el correo" }, { status: 500 });
    }

    return NextResponse.json({ message: "Contraseña reseteada y correo enviado exitosamente" });
  } catch (error: any) {
    console.error("Error al resetear contraseña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
