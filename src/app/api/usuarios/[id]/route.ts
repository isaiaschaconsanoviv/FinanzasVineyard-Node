import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).rol !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const params = await props.params;
    const body = await request.json();
    const { nombre, correo, usuario, password, rol, activo } = body;

    const dataToUpdate: any = {
      nombre,
      correo,
      usuario,
      rol,
      activo
    };

    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
      }
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: params.id },
      data: dataToUpdate
    });

    return NextResponse.json({ message: "Usuario actualizado exitosamente" });
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "El nombre de usuario ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}
