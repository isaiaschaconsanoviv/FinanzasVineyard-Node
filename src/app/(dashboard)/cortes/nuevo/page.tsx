"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calculator } from "lucide-react";

interface Cuenta {
  concepto: string;
  saldoSistema: number;
  saldoFisico: string;
  diferencia: number;
}

export default function NuevoCortePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    const fetchSaldos = async () => {
      try {
        const res = await fetch("/api/cortes/calcular");
        if (!res.ok) throw new Error("Error al obtener saldos del sistema");
        const data = await res.json();
        
        // Transformar objeto en array de Cuentas, ordenando alfabéticamente
        const cuentasArray = Object.keys(data).sort().map(key => ({
          concepto: key,
          saldoSistema: data[key],
          saldoFisico: "",
          diferencia: 0
        }));
        
        setCuentas(cuentasArray);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSaldos();
  }, []);

  const handleFisicoChange = (index: number, valor: string) => {
    const newCuentas = [...cuentas];
    newCuentas[index].saldoFisico = valor;
    
    // Calcular diferencia
    const fisico = parseFloat(valor) || 0;
    newCuentas[index].diferencia = fisico - newCuentas[index].saldoSistema;
    
    setCuentas(newCuentas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Validar que todas tengan saldo físico capturado
      if (cuentas.some(c => c.saldoFisico === "")) {
        throw new Error("Por favor, ingresa el saldo físico de todas las cuentas (incluso si es 0)");
      }

      const res = await fetch("/api/cortes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notas,
          registros: cuentas.map(c => ({
            concepto: c.concepto,
            saldoFisico: c.saldoFisico,
            saldoSistema: c.saldoSistema,
            diferencia: c.diferencia
          }))
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar el corte");
      }

      router.push("/cortes");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 animate-fade-in"><Calculator className="animate-spin mb-4 mx-auto" /> Calculando saldos de toda la historia...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Realizar Corte de Caja</h1>
          <p className="text-gray-400 mt-2">Punto de conciliación para establecer saldos reales.</p>
        </div>
        <Link href="/cortes" className="btn btn-secondary">
          Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8">
        {error && (
          <div className="mb-6 p-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block mb-2 font-medium">Notas (Opcional)</label>
          <textarea 
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="input-field w-full"
            placeholder="Ej. Saldo inicial por inicio del sistema en Agosto 2026"
            rows={3}
          />
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Cuadre de Cuentas</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table mb-8">
            <thead>
              <tr>
                <th>Cuenta</th>
                <th style={{ textAlign: 'right', width: '20%' }}>Saldo Sistema</th>
                <th style={{ textAlign: 'right', width: '25%' }}>Saldo Físico (MXN)</th>
                <th style={{ textAlign: 'right', width: '20%' }}>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((c, index) => (
                <tr key={c.concepto}>
                  <td style={{ fontWeight: 500 }}>{c.concepto}</td>
                  <td style={{ textAlign: 'right' }} className="text-muted">
                    ${c.saldoSistema.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                      <input 
                        type="number"
                        step="0.01"
                        className="input-field"
                        style={{ paddingLeft: '1.75rem', width: '120px', textAlign: 'right', paddingRight: '0.5rem' }}
                        value={c.saldoFisico}
                        onChange={(e) => handleFisicoChange(index, e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }} className={c.diferencia < 0 ? "text-danger" : c.diferencia > 0 ? "text-accent" : "text-muted"}>
                    {c.diferencia > 0 ? '+' : ''}{c.diferencia === 0 ? '-' : `$${c.diferencia.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={saving} style={{ padding: '1rem', fontSize: '1.1rem' }}>
          {saving ? "Registrando Corte..." : "Confirmar y Cerrar Caja"}
        </button>
      </form>
    </div>
  );
}
