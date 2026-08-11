"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

interface TestSombraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestSombraModal({ isOpen, onClose }: TestSombraModalProps) {
  const [resultados, setResultados] = useState<any[]>([]);
  const [reglas, setReglas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      runTest();
    }
  }, [isOpen]);

  const runTest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reglas/test');
      const data = await res.json();
      // Group Pastor bonuses in the Nuevo engine for a clean comparison
      const processedResultados = data.resultados.map((r: any) => {
        if (r.nuevo) {
          const basePastor = r.nuevo["Pastor"] || 0;
          // Match the new names "Apoyo gasolina" and "Apoyo celular" or the old ones
          const bonoDomingo = r.nuevo["Bono Pastor Domingo"] || r.nuevo["Apoyo gasolina"] || 0;
          const bonoUltimo = r.nuevo["Bono Pastor Ultimo Domingo"] || r.nuevo["Apoyo celular"] || 0;
          
          if (basePastor > 0 || bonoDomingo > 0 || bonoUltimo > 0) {
            r.nuevo["Pastor"] = basePastor + bonoDomingo + bonoUltimo;
          }
          delete r.nuevo["Bono Pastor Domingo"];
          delete r.nuevo["Bono Pastor Ultimo Domingo"];
          delete r.nuevo["Apoyo gasolina"];
          delete r.nuevo["Apoyo celular"];
        }
        return r;
      });
      
      setResultados(processedResultados);
      setReglas(data.reglas);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="glass-panel" style={{
        width: '95%', maxWidth: '800px',
        padding: '2rem',
        animation: 'slideUp 0.3s ease-out',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Prueba de Modo Sombra
              {loading && <RefreshCw size={18} className="animate-spin text-purple-400" />}
            </h2>
            <p className="text-sm text-gray-400 mt-1">Comparando el algoritmo viejo contra el motor dinámico en las últimas 10 entradas.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        
        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Ejecutando motores...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {resultados.map((res: any, idx) => {
              const date = new Date(res.fecha).toLocaleDateString();
              
              // Verify differences
              const keys = Array.from(new Set([...Object.keys(res.viejo), ...Object.keys(res.nuevo)]));
              let hasMismatch = false;
              
              // Sort keys by ordenVisual
              const comparison = keys.map(k => {
                const viejo = res.viejo[k] || 0;
                const nuevo = res.nuevo[k] || 0;
                const diff = Math.abs(viejo - nuevo);
                
                // Encontrar el orden visual de esta regla
                const reglaDef = reglas.find(r => r.nombre === k);
                let visual = 99;
                if (reglaDef) {
                  visual = reglaDef.ordenVisual;
                } else if (k === "Ingreso") {
                  visual = 100;
                }
                
                const isIgnored = ["Ingreso", "Pastor", "Aguinaldo Pastor", "Bono Pastor Domingo", "Bono Pastor Ultimo Domingo", "Apoyo gasolina", "Apoyo celular"].includes(k);
                if (diff > 0.1 && !isIgnored) {
                  hasMismatch = true;
                }
                return { key: k, viejo, nuevo, diff, visual };
              })
              .filter(c => c.viejo > 0 || c.nuevo > 0)
              .sort((a, b) => a.visual - b.visual);

              return (
                <div key={res.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontWeight: 500, color: '#c084fc' }}>Entrada del {date}</div>
                    {hasMismatch ? (
                      <span className="text-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}><AlertTriangle size={14}/> Diferencia Encontrada</span>
                    ) : (
                      <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}><CheckCircle size={14}/> Idéntico</span>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                    <div>Rubro</div>
                    <div style={{ textAlign: 'right' }}>Algoritmo Viejo</div>
                    <div style={{ textAlign: 'right' }}>Motor Nuevo</div>
                  </div>
                  
                  {comparison.map(c => (
                    <div key={c.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: '0.875rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                      <div style={{ color: '#d1d5db' }}>{c.key}</div>
                      <div style={{ textAlign: 'right' }}>${c.viejo.toFixed(2)}</div>
                      <div className={c.diff > 0.1 && c.key !== "Ingreso" && c.key !== "Aguinaldo Pastor" ? 'text-danger font-bold' : 'text-success'} style={{ textAlign: 'right' }}>
                        ${c.nuevo.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic', padding: '0 0.5rem' }}>
                    * Nota: 'Ingreso' y 'Aguinaldo' pueden diferir en el algoritmo viejo si esta entrada ya tiene gastos descontados.
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
