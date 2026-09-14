"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { UsuarioModal } from "@/components/ui/UsuarioModal";

export default function UsuariosClient({ usuarios, session }: { usuarios: any[], session: any }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .mobile-expanded-row { display: table-row !important; }
          .clickable-row { cursor: pointer; }
          .mobile-only-icon { display: inline-block !important; }
        }
        @media (min-width: 769px) {
          .mobile-expanded-row { display: none !important; }
          .mobile-only-icon { display: none !important; }
        }
      `}} />
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th className="hide-on-mobile">Estado</th>
              <th className="hide-on-mobile">Último Acceso</th>
              <th className="hide-on-mobile"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => {
              const isExpanded = expandedRows[user.id];
              return (
                <React.Fragment key={user.id}>
                  <tr className="clickable-row" onClick={() => toggleRow(user.id)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="mobile-only-icon" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                        {user.nombre || <span style={{ color: 'var(--text-muted)' }}>No definido</span>}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{user.usuario}</td>
                    <td>
                      <span className={`badge ${user.rol === 'ADMIN' ? 'badge-primary' : user.rol === 'STAFF' ? 'badge-info' : 'badge-secondary'}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="hide-on-mobile">
                      {user.activo ? (
                        <span className="text-success" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Activo</span>
                      ) : (
                        <span className="text-danger" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Inactivo</span>
                      )}
                    </td>
                    <td className="hide-on-mobile" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {new Date(user.lastLogin).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="hide-on-mobile" style={{ textAlign: 'right' }}>
                      {isAdmin && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenEditar(user); }} 
                          className="btn btn-secondary btn-sm" 
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="mobile-expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <td colSpan={3} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-gray-400 text-sm">Estado:</span>
                            <span>
                              {user.activo ? (
                                <span className="text-success" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Activo</span>
                              ) : (
                                <span className="text-danger" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Inactivo</span>
                              )}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-gray-400 text-sm">Último Acceso:</span>
                            <span style={{ fontSize: '0.9rem' }}>
                              {new Date(user.lastLogin).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>
                          
                          {isAdmin && (
                            <div style={{ display: 'flex', marginTop: '0.5rem' }}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenEditar(user); }} 
                                className="btn btn-secondary btn-sm flex-1" 
                                style={{ padding: '0.5rem', justifyContent: 'center' }}
                              >
                                Editar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
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
