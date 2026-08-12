"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();

      // We don't want to expose if the email exists or not to the user for security reasons.
      // We will show success regardless of whether the email was found or not, 
      // unless there's a server error.
      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al procesar tu solicitud");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '1rem',
      backgroundColor: '#111827'
    }}>
      {/* Background with blur like login */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'url("https://images.unsplash.com/photo-1596404987515-b746816ed973?q=80&w=2000&auto=format&fit=crop")',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)'
        }} />
      </div>

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        position: 'relative',
        zIndex: 10,
        margin: 'auto',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="text-3xl font-bold mb-2">Recuperar Contraseña</h1>
          <p className="text-gray-300 text-sm">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ width: '4rem', height: '4rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <CheckCircle2 size={32} style={{ color: '#4ade80' }} />
            </div>
            <h2 className="text-xl font-bold mb-2">Correo Enviado</h2>
            <p className="text-gray-300 mb-6">Si el correo proporcionado está asociado a una cuenta, recibirás un enlace seguro para restablecer tu contraseña en los próximos minutos.</p>
            <Link href="/login" className="btn btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
              Regresar al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="correo"
                  type="email"
                  className="input-field w-full"
                  style={{ paddingLeft: '2.5rem' }}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="ejemplo@correo.com"
                />
                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                  <Mail size={18} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading || !correo}
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
