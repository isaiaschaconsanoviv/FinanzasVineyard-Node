"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Select } from "@/components/ui/Select";

export default function EditUserForm({ usuario }: { usuario: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nombre: usuario.nombre || "",
    correo: usuario.correo || "",
    usuario: usuario.usuario || "",
    password: "",
    confirmPassword: "",
    rol: usuario.rol || "READONLY",
    activo: usuario.activo,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password || formData.confirmPassword) {
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
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PATCH",
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
        throw new Error(data.error || "Ocurrió un error al actualizar el usuario");
      }

      setSuccess("Usuario actualizado exitosamente");
      
      // Limpiar campos de contraseña por seguridad
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));

      setTimeout(() => {
        router.push("/usuarios");
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="text-3xl font-bold">Editar Usuario</h1>
        <Link href="/usuarios" className="btn btn-secondary">
          Volver
        </Link>
      </div>

      <div className="glass-panel p-8">
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
          <div className="responsive-grid">
            
            <div className="input-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="input-field"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className="input-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                id="correo"
                name="correo"
                type="email"
                className="input-field"
                value={formData.correo}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="input-group">
              <label htmlFor="usuario">Usuario (Login) *</label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                className="input-field"
                value={formData.usuario}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
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

            <div className="input-group">
              <label htmlFor="password">Nueva Contraseña (Opcional)</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                placeholder="Déjalo en blanco para no cambiarla"
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="input-field"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la nueva contraseña"
              />
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

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-8" 
            disabled={loading}
            style={{ padding: '1rem', fontSize: '1.1rem' }}
          >
            {loading ? "Actualizando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
