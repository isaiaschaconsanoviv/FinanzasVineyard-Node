"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { UsuarioModal } from "@/components/ui/UsuarioModal";

export default function UsuariosClient({ usuarios, session }: { usuarios: any[], session: any }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);

  const handleOpenNuevo = () => {
    setSelectedUsuario(null);
    setIsModalOpen(true);
  };

  const handleOpenEditar = (usuario: any) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleSaved = () => {
    router.refresh();
  };

  const isAdmin = session?.user && session.user.rol === "ADMIN";

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        {isAdmin && (
          <button onClick={handleOpenNuevo} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Plus size={18} />
            Nuevo Usuario
          </button>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td>{user.nombre || <span style={{ color: 'var(--text-muted)' }}>No definido</span>}</td>
                <td style={{ fontWeight: 500 }}>{user.usuario}</td>
                <td>
                  <span className={`badge ${user.rol === 'ADMIN' ? 'badge-primary' : user.rol === 'STAFF' ? 'badge-info' : 'badge-secondary'}`}>
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
                  {new Date(user.lastLogin).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {isAdmin && (
                    <button 
                      onClick={() => handleOpenEditar(user)} 
                      className="btn btn-secondary btn-sm" 
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UsuarioModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        usuarioInicial={selectedUsuario}
      />
    </div>
  );
}
