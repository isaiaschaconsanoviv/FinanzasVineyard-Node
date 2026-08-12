"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { Key } from "lucide-react";

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    usuario: "",
    password: "",
    confirmPassword: "",
    rol: "READONLY",
    activo: true,
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

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
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
        throw new Error(data.error || "Ocurrió un error al crear el usuario");
      }

      setSuccess("Usuario creado exitosamente");
      setFormData({
        nombre: "",
        correo: "",
        usuario: "",
        password: "",
        confirmPassword: "",
        rol: "READONLY",
        activo: true,
      });
      
      // Opcional: Redirigir al listado después de unos segundos
      setTimeout(() => {
        router.push("/usuarios"); // Asumiendo que existirá un listado de usuarios
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="text-3xl font-bold">Crear Nuevo Usuario</h1>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ marginBottom: 0 }}>Contraseña *</label>
                <button 
                  type="button" 
                  onClick={generateSecurePassword}
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center', margin: 0 }}
                  title="Generar contraseña de 12 caracteres"
                >
                  <Key size={14} /> Generar Segura
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="input-field"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
            <input
              id="activo"
              name="activo"
              type="checkbox"
              checked={formData.activo}
              onChange={handleChange}
              style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--accent-primary)' }}
            />
            <label htmlFor="activo" style={{ margin: 0, cursor: 'pointer', fontSize: '1rem' }}>
              Usuario Activo (Puede iniciar sesión)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 2rem' }}>
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
