"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Key, Eye, EyeOff, Trash2, Mail, RefreshCw } from "lucide-react";
import { Select } from "./Select";
import { ConfirmModal } from "./ConfirmModal";

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  usuarioInicial?: any;
}

export function UsuarioModal({ isOpen, onClose, onSaved, usuarioInicial }: UsuarioModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [emailActionLoading, setEmailActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    usuario: "",
    password: "",
    confirmPassword: "",
    rol: "READONLY",
    activo: true,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      setError("");
      setSuccess("");
      setShowPassword(false);
      
      if (usuarioInicial) {
        setFormData({
          nombre: usuarioInicial.nombre || "",
          correo: usuarioInicial.correo || "",
          usuario: usuarioInicial.usuario || "",
          password: "",
          confirmPassword: "",
          rol: usuarioInicial.rol || "READONLY",
          activo: usuarioInicial.activo !== undefined ? usuarioInicial.activo : true,
        });
      } else {
        setFormData({
          nombre: "",
          correo: "",
          usuario: "",
          password: "",
          confirmPassword: "",
          rol: "READONLY",
          activo: true,
        });
      }
    }
  }, [isOpen, usuarioInicial]);

  if (!isOpen || !mounted) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const generateSecurePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pwd, confirmPassword: pwd }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const isPasswordProvided = formData.password || formData.confirmPassword;
    const isPasswordRequired = !usuarioInicial && !formData.correo;

    if (isPasswordRequired && !isPasswordProvided) {
      setError("Debes proporcionar una contraseña o un correo electrónico");
      return;
    }

    if (isPasswordProvided) {
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    setLoading(true);

    try {
      const isEditing = !!usuarioInicial;
      const url = isEditing ? `/api/usuarios/${usuarioInicial.id}` : "/api/usuarios";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.correo,
          usuario: formData.usuario,
          password: formData.password,
          rol: formData.rol,
          activo: formData.activo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al guardar el usuario");
      }

      setSuccess(`Usuario ${isEditing ? 'actualizado' : 'creado'} exitosamente`);
      
      // Esperar un momento para mostrar el mensaje de éxito antes de cerrar
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!usuarioInicial) return;
    
    setDeleting(true);
    setError("");
    
    try {
      const res = await fetch(`/api/usuarios/${usuarioInicial.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al eliminar el usuario");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const handleEmailAction = async (action: 'reenviar-bienvenida' | 'reset-password') => {
    if (!usuarioInicial) return;
    
    setEmailActionLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch(`/api/usuarios/${usuarioInicial.id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Error al realizar la acción de correo");
      
      setSuccess(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEmailActionLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', 
      alignItems: 'flex-start', 
      justifyContent: 'center',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '2rem 1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '600px',
        padding: '2rem',
        animation: 'slideUp 0.3s ease-out',
        position: 'relative',
        margin: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="text-2xl font-bold">{usuarioInicial ? "Editar Usuario" : "Crear Nuevo Usuario"}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#6ee7b7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            
            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="input-field w-full"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                id="correo"
                name="correo"
                type="email"
                className="input-field w-full"
                value={formData.correo}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="usuario">Usuario (Login) *</label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                className="input-field w-full"
                value={formData.usuario}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="rol">Rol del Usuario *</label>
              <Select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={(e) => handleChange(e as any)}
                options={[
                  { value: "READONLY", label: "Solo Lectura (Read Only)" },
                  { value: "ADMIN", label: "Administrador" }
                ]}
                required
              />
            </div>

            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ margin: 0 }}>
                  {usuarioInicial ? "Nueva Contraseña" : "Contraseña"} {!usuarioInicial && !formData.correo && "*"}
                </label>
                <button 
                  type="button" 
                  onClick={generateSecurePassword}
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center', margin: 0 }}
                  title="Generar contraseña de 12 caracteres"
                >
                  <Key size={14} /> Generar
                </button>
              </div>
              <div style={{ position: 'relative', marginTop: 'auto' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input-field w-full"
                  style={{ paddingRight: '2.5rem' }}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={usuarioInicial ? "Déjalo en blanco para no cambiarla" : (formData.correo ? "Opcional. Se enviará link por correo." : "")}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="confirmPassword">
                {usuarioInicial ? "Confirmar Nueva" : "Confirmar Contraseña"} {!usuarioInicial && !formData.correo && "*"}
              </label>
              <div style={{ position: 'relative', marginTop: 'auto' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="input-field w-full"
                  style={{ paddingRight: '2.5rem' }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={usuarioInicial ? "Repite la nueva contraseña" : (formData.correo ? "Opcional" : "")}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="input-group mt-6">
            <label className="flex items-center gap-3 cursor-pointer" style={{ userSelect: 'none' }}>
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
              />
              <div>
                <span className="font-medium text-lg">Usuario Activo</span>
                <p className="text-sm text-gray-400">Si desmarcas esta opción, el usuario no podrá iniciar sesión en el sistema.</p>
              </div>
            </label>
          </div>

          {usuarioInicial && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>Acciones de Correo</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => handleEmailAction('reenviar-bienvenida')}
                  disabled={loading || deleting || emailActionLoading}
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  <Mail size={16} />
                  Reenviar Bienvenida
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => handleEmailAction('reset-password')}
                  disabled={loading || deleting || emailActionLoading}
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  <RefreshCw size={16} />
                  Resetear Contraseña
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            {usuarioInicial ? (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsConfirmDeleteOpen(true)}
                disabled={loading || deleting}
                style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <Trash2 size={18} />
                {deleting ? "Eliminando..." : "Eliminar Usuario"}
              </button>
            ) : (
              <div></div> // Spacer
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-dark" onClick={onClose} disabled={loading || deleting || emailActionLoading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || deleting || emailActionLoading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${usuarioInicial?.usuario}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        isDanger={true}
      />
    </div>,
    document.body
  );
}
