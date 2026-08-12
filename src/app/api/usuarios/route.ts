import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { enviarCorreo } from "@/lib/email";
import WelcomeEmail from "@/emails/WelcomeEmail";
import * as React from "react";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        usuario: true,
        correo: true,
        rol: true,
        activo: true,
        lastLogin: true
      },
      orderBy: { nombre: 'asc' }
    });
    
    return NextResponse.json(usuarios);
  } catch (error: any) {
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Solo los administradores pueden crear usuarios
    if (!session || (session.user as any).rol !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado. Solo un administrador puede crear usuarios." }, { status: 403 });
    }

    const body = await req.json();
    const { nombre, correo, usuario, password, rol, activo } = body;

    if (!usuario || !rol) {
      return NextResponse.json({ error: "Faltan datos obligatorios (Usuario y Rol)" }, { status: 400 });
    }
    
    if (!password && !correo) {
      return NextResponse.json({ error: "Debes proporcionar una contraseña o un correo electrónico para que el usuario pueda configurarla." }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { usuario },
          // Solo buscamos por correo si enviaron un correo (no vacío)
          ...(correo ? [{ correo }] : [])
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "El nombre de usuario o el correo electrónico ya están registrados." }, { status: 400 });
    }

    let hashedPassword = "";
    let resetToken = null;
    let resetTokenExpiry = null;
    
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Si no hay contraseña, generamos una basura aleatoria para cumplir con la BD 
      // y creamos el token para que el usuario ponga la real.
      hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
    }
    
    if (correo) {
      resetToken = crypto.randomBytes(32).toString("hex");
      resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    const newUser = await prisma.usuario.create({
      data: {
        nombre: nombre || null,
        correo: correo || null,
        usuario,
        password: hashedPassword,
        rol,
        activo: activo === undefined ? true : activo,
        resetToken,
        resetTokenExpiry,
      }
    });

    if (correo && resetToken) {
      // Send welcome email in background
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://finanzas-vineyard.vercel.app";
      const setupLink = `${appUrl}/setup-password?token=${resetToken}`;
      
      enviarCorreo({
        to: correo,
        subject: "Bienvenido a Finanzas Vineyard",
        react: React.createElement(WelcomeEmail, {
          nombre: nombre || "",
          usuario: usuario,
          setupLink,
        }),
      });
    }

    return NextResponse.json({ message: "Usuario creado exitosamente", id: newUser.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 });
  }
}
