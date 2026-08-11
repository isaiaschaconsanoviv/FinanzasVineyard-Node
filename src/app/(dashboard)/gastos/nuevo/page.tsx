"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Select } from "@/components/ui/Select";

export default function NuevoGastoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    cuenta: "",
    concepto: "",
    importe: ""
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let comprobanteUrl = null;

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          throw new Error("Error al subir el comprobante");
        }
        const uploadJson = await uploadRes.json();
        comprobanteUrl = uploadJson.url;
      }

      const payload = {
        ...formData,
        comprobanteUrl
      };

      const res = await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar");
      }

      router.push("/gastos");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="text-3xl font-bold">Registrar Gasto</h1>
        <Link href="/gastos" className="btn btn-secondary">
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
          <label>Fecha</label>
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
          <label>Cuenta</label>
          <Select
            id="cuenta"
            name="cuenta"
            value={formData.cuenta}
            onChange={handleChange}
            options={[
              { value: "10% Diezmo", label: "Diezmo (10%)" },
              { value: "3% Viña Nacional", label: "Viña Nacional (3%)" },
              { value: "Misiones (10%)", label: "Misiones (10%)" },
              { value: "Eventos (5%)", label: "Eventos (5%)" },
              { value: "Aguinaldo Pastor", label: "Aguinaldo Pastor" },
              { value: "Ingreso", label: "Fondo General (Ingreso)" }
            ]}
            required
          />
        </div>

        <div className="input-group mt-4">
          <label>Concepto / Descripción</label>
          <input 
            type="text" 
            name="concepto" 
            value={formData.concepto} 
            onChange={handleChange} 
            className="input-field"
            placeholder="Ej. Pago de luz eléctrica de Agosto"
            required 
          />
        </div>

        <div className="input-group mt-4">
          <label>Comprobante (Opcional)</label>
          <input 
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="input-field"
            style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)' }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Puedes tomar una foto del ticket desde tu celular o subir un archivo.</span>
        </div>

        <div className="input-group mt-4 mb-8">
          <label>Importe</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
            <input 
              type="number" 
              step="0.01"
              name="importe" 
              value={formData.importe} 
              onChange={handleChange} 
              className="input-field w-full"
              style={{ paddingLeft: '2rem' }}
              placeholder="0.00"
              required 
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '0.8rem' }}>
          {loading ? "Registrando..." : "Guardar Gasto"}
        </button>
      </form>
    </div>
  );
}
