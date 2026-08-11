"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NuevaEntradaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(true);
  const [error, setError] = useState("");
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    fecha: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    tipoCambio: "",
    notas: "",
    elaboradoPor: ""
  });

  useEffect(() => {
    // Fetch current exchange rate automatically
    const fetchRate = async () => {
      try {
        const res = await fetch('/api/exchange-rate');
        const data = await res.json();
        setFormData(prev => ({ ...prev, tipoCambio: data.rates.MXN.toFixed(2) }));
      } catch (e) {
        console.error("Error fetching rate", e);
      } finally {
        setFetchingRate(false);
      }
    };
    
    const fetchUsuarios = async () => {
      try {
        const res = await fetch('/api/usuarios');
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsuariosDisponibles(data.filter((u: any) => u.activo));
        }
      } catch (e) {
        console.error("Error fetching users", e);
      }
    };

    fetchRate();
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (session?.user?.name && !formData.elaboradoPor) {
       const fullName = (session.user as any).nombre || session.user.name;
       setFormData(prev => ({ ...prev, elaboradoPor: fullName }));
    }
  }, [session, formData.elaboradoPor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleUsuario = (nombreUsuario: string) => {
    const actuales = formData.elaboradoPor.split(",").map(n => n.trim()).filter(n => n);
    
    if (actuales.includes(nombreUsuario)) {
      // Remove it
      setFormData({ ...formData, elaboradoPor: actuales.filter(n => n !== nombreUsuario).join(", ") });
    } else {
      // Add it
      setFormData({ ...formData, elaboradoPor: [...actuales, nombreUsuario].join(", ") });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/entradas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al crear la entrada");

      const data = await res.json();
      router.push(`/entradas/${data.id}`); // Redirect to capture page
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="text-3xl font-bold">Crear Nueva Entrada</h1>
        <Link href="/entradas" className="btn btn-secondary">
          Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8">
        {error && (
          <div className="mb-6 p-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="input-group">
          <label>Fecha del Servicio</label>
          <input 
            type="date" 
            name="fecha" 
            value={formData.fecha} 
            onChange={handleChange} 
            className="input-field"
            required 
          />
        </div>

        <div className="input-group mt-4">
          <label>Tipo de Cambio (MXN por USD)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
            <input 
              type="number" 
              step="0.01"
              name="tipoCambio" 
              value={formData.tipoCambio} 
              onChange={handleChange} 
              className="input-field w-full"
              style={{ paddingLeft: '2rem' }}
              disabled={fetchingRate}
              required 
            />
          </div>
          {fetchingRate && <small style={{ color: 'var(--accent-primary)', marginTop: '0.25rem', display: 'block' }}>Obteniendo tipo de cambio del día...</small>}
        </div>

        <div className="input-group mt-4">
          <label>Elaborado Por (Involucrados)</label>
          <input 
            type="text" 
            name="elaboradoPor" 
            value={formData.elaboradoPor} 
            onChange={handleChange} 
            className="input-field"
            placeholder="Ej. Isaias Chacon, Juan Perez"
            required 
          />
          {usuariosDisponibles.length > 0 && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {usuariosDisponibles.map(u => {
                const nombreMostrar = u.nombre || u.usuario;
                const estaSeleccionado = formData.elaboradoPor.includes(nombreMostrar);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUsuario(nombreMostrar)}
                    className={`badge ${estaSeleccionado ? 'badge-primary' : 'badge-secondary'}`}
                    style={{ border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {estaSeleccionado ? '✓ ' : '+ '}{nombreMostrar}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="input-group mt-4 mb-8">
          <label>Notas (Opcional)</label>
          <textarea 
            name="notas" 
            value={formData.notas} 
            onChange={handleChange} 
            className="input-field"
            rows={3}
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading || fetchingRate} style={{ padding: '0.8rem' }}>
          {loading ? "Creando..." : "Crear y Continuar a Captura"}
        </button>
      </form>
    </div>
  );
}
