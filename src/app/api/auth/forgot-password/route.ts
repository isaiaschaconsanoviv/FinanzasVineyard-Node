import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { enviarCorreo } from "@/lib/email";
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";
import * as React from "react";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { correo } = body;

    if (!correo) {
      return NextResponse.json({ error: "Falta el correo electrónico" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo }
    });

    // Si el usuario no existe o no está activo, devolvemos success igualmente por seguridad
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ message: "Si el correo está registrado, recibirás un enlace de recuperación." });
    }

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Guardar token en BD
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetToken, resetTokenExpiry }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://finanzas-vineyard.vercel.app";
    const setupLink = `${appUrl}/setup-password?token=${resetToken}`;

    // Enviar correo (en segundo plano para no bloquear la respuesta HTTP)
    enviarCorreo({
      to: usuario.correo as string,
      subject: "Restablecimiento de Contraseña - Finanzas Vineyard",
      react: React.createElement(ResetPasswordEmail, {
        nombre: usuario.nombre || "",
        usuario: usuario.usuario,
        setupLink,
      }),
    });

    return NextResponse.json({ message: "Si el correo está registrado, recibirás un enlace de recuperación." });
  } catch (error: any) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
