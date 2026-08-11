import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plus } from "lucide-react";

const prisma = new PrismaClient();

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);
  
  const usuarios = await prisma.usuario.findMany({
    orderBy: { nombre: 'asc' }
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        {session?.user && (session.user as any).rol === "ADMIN" && (
          <Link href="/usuarios/nuevo" className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Plus size={18} />
            Nuevo Usuario
          </Link>
        )}
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td>{user.nombre || <span style={{ color: 'var(--text-muted)' }}>No definido</span>}</td>
                <td style={{ fontWeight: 500 }}>{user.usuario}</td>
                <td>
                  <span className={`badge ${user.rol === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                    {user.rol}
                  </span>
                </td>
                <td>
                  {user.activo ? (
                    <span className="text-success" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Activo</span>
                  ) : (
                    <span className="text-danger" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Inactivo</span>
                  )}
                </td>
                <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {new Date(user.lastLogin).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
