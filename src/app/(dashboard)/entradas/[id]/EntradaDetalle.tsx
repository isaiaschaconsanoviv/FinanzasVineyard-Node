"use client";
// cache-buster-4

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, ChevronLeft, Plus, Edit2, Receipt, Share2 } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { GastoModal } from "@/components/ui/GastoModal";

export default function EntradaDetalle({ entrada }: { entrada: any }) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [gastoToEdit, setGastoToEdit] = useState<any>(null);
  const [tcLocal, setTcLocal] = useState(entrada.tipoCambio.toString());
  const [isEditingTc, setIsEditingTc] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, idToDelete: string | null, type: 'registro' | 'gasto'}>({ isOpen: false, idToDelete: null, type: 'registro' });
  const [otros, setOtros] = useState<{ id: number, tipo: string, importe: string, moneda: string }[]>([]);
  const [formData, setFormData] = useState({
    nombre: "",
    diezmo: "",
    monedaDiezmo: "MXN",
    ofrenda: "",
    monedaOfrenda: "MXN"
  });

  const tc = entrada.tipoCambio;
  
  const toMXN = (importe: number, moneda: string) => {
    return moneda === "MXN" ? importe : importe * tc;
  };

  // Calculations
  let totalDiezmosMXN = 0;
  let totalOfrendasMXN = 0;
  
  entrada.registros.forEach((r: any) => {
    totalDiezmosMXN += toMXN(r.diezmo, r.monedaDiezmo);
    totalOfrendasMXN += toMXN(r.ofrenda, r.monedaOfrenda);
  });

  let t10pdiezmo = 0;
  let t3pnacional = 0;
  let t10pmisiones = 0;
  let t5peventos = 0;

  let tparcialpastor = 0;
  let totalfinalpastor = 0;
  let ingreso = 0;
  
  let apoyogasolina = false;
  let apoyocelular = false;
  let aguinaldo = false;

  const sumDiezmosOfrendas = totalDiezmosMXN + totalOfrendasMXN;

  if (sumDiezmosOfrendas > 500) {
    // 1. Diezmo (10%)
    t10pdiezmo = totalDiezmosMXN * 0.10;
    let r1 = t10pdiezmo % 10;
    t10pdiezmo += r1 > 0 ? 10 - r1 : 0;

    // 2. Viña Nacional (3%)
    t3pnacional = (totalDiezmosMXN - t10pdiezmo + totalOfrendasMXN) * 0.03;
    let r2 = t3pnacional % 10;
    t3pnacional += r2 > 0 ? 10 - r2 : 0;

    // 3. Parcial Pastor
    let parcial = (totalDiezmosMXN - t10pdiezmo - t3pnacional + totalOfrendasMXN) / 2;
    let r3 = parcial % 10;
    tparcialpastor = parcial + (r3 > 0 ? 10 - r3 : 0);

    // 4. Final Pastor
    let ingresoparcial = (totalDiezmosMXN - t10pdiezmo - t3pnacional + totalOfrendasMXN) / 2;
    totalfinalpastor = ingresoparcial;

    // Check dates
    const dateObj = new Date(entrada.fecha);
    const IsSunday = dateObj.getUTCDay() === 0;
    let IsLastSunday = false;
    if (IsSunday) {
        const nextSunday = new Date(dateObj);
        nextSunday.setUTCDate(dateObj.getUTCDate() + 7);
        IsLastSunday = nextSunday.getUTCMonth() !== dateObj.getUTCMonth();
    }
    
    if (IsSunday && ingresoparcial > 250) {
        apoyogasolina = true;
        totalfinalpastor += 250;
        ingresoparcial -= 250;
    }
    
    if (IsLastSunday && ingresoparcial > 250) {
        apoyocelular = true;
        totalfinalpastor += 250;
    }
    
    let r4 = totalfinalpastor % 10;
    totalfinalpastor += r4 > 0 ? 10 - r4 : 0;

    // 5. Misiones (10%)
    t10pmisiones = (totalDiezmosMXN - t10pdiezmo - t3pnacional - totalfinalpastor + totalOfrendasMXN) * 0.10;
    let r5 = t10pmisiones % 10;
    t10pmisiones += r5 > 0 ? 10 - r5 : 0;

    // 6. Eventos (5%)
    t5peventos = (totalDiezmosMXN - t10pdiezmo - t3pnacional + totalOfrendasMXN - totalfinalpastor - t10pmisiones) * 0.05;
    let r6 = t5peventos % 10;
    t5peventos += r6 > 0 ? 10 - r6 : 0;
    
    // 7. Ingreso Neto
    ingreso = totalDiezmosMXN - t10pdiezmo - t3pnacional + totalOfrendasMXN - t10pmisiones - t5peventos - totalfinalpastor;
    
    if (ingreso >= 100 && IsSunday) {
        aguinaldo = true;
        ingreso -= 100;
    }
  } else {
    tparcialpastor = sumDiezmosOfrendas;
    totalfinalpastor = sumDiezmosOfrendas;
    ingreso = 0;
  }

  // Descontar gastos registrados
  let gastosIngreso = 0;
  let gastosDiezmo = 0;
  let gastosNacional = 0;
  let gastosMisiones = 0;
  let gastosEventos = 0;
  let gastosPastor = 0;
  let gastosAguinaldo = 0;

  if (entrada.gastos) {
    entrada.gastos.forEach((g: any) => {
      if (g.cuenta === '10% Diezmo') gastosDiezmo += g.importe;
      else if (g.cuenta === '3% Viña Nacional') gastosNacional += g.importe;
      else if (g.cuenta === 'Misiones (10%)') gastosMisiones += g.importe;
      else if (g.cuenta === 'Eventos (5%)') gastosEventos += g.importe;
      else if (g.cuenta === 'Pastor') gastosPastor += g.importe;
      else if (g.cuenta === 'Aguinaldo Pastor') gastosAguinaldo += g.importe;
      else gastosIngreso += g.importe; // Cualquier otra cuenta afecta al fondo general (Ingreso)
    });
  }

  t10pdiezmo -= gastosDiezmo;
  t3pnacional -= gastosNacional;
  t10pmisiones -= gastosMisiones;
  t5peventos -= gastosEventos;
  totalfinalpastor -= gastosPastor;
  ingreso -= gastosIngreso;

  // Agrupar Otros Rubros
  const otrosAgrupados: { [key: string]: { mxn: number, usd: number } } = {};
  entrada.registros.forEach((r: any) => {
    if (r.otrosRubros) {
      r.otrosRubros.forEach((o: any) => {
        if (!otrosAgrupados[o.tipo]) {
          otrosAgrupados[o.tipo] = { mxn: 0, usd: 0 };
        }
        if (o.moneda === "MXN") {
          otrosAgrupados[o.tipo].mxn += o.importe;
        } else {
          otrosAgrupados[o.tipo].usd += o.importe;
        }
      });
    }
  });
  const otrosKeys = Object.keys(otrosAgrupados).sort();

  const nombresUnicos = Array.from(new Set(entrada.registros.map((r: any) => r.nombre))) as string[];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/entradas/${entrada.id}/registros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otros }),
      });

      if (!res.ok) throw new Error("Error al guardar el registro");
      
      setFormData({
        nombre: "",
        diezmo: "",
        monedaDiezmo: "MXN",
        ofrenda: "",
        monedaOfrenda: "MXN"
      });
      setOtros([]);
      router.refresh();
      document.getElementById("nombre-input")?.focus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (registroId: string) => {
    try {
      const res = await fetch(`/api/entradas/${entrada.id}/registros/${registroId}`, { method: "DELETE" });
      router.refresh();
      setConfirmModal({ isOpen: false, idToDelete: null, type: 'registro' });
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  const handleDeleteGasto = async (gastoId: string) => {
    try {
      const res = await fetch(`/api/gastos/${gastoId}`, { method: "DELETE" });
      router.refresh();
      setConfirmModal({ isOpen: false, idToDelete: null, type: 'gasto' });
    } catch (err) {
      alert("Error al eliminar gasto");
    }
  };

  const handleConfirmDelete = () => {
    if (!confirmModal.idToDelete) return;
    if (confirmModal.type === 'registro') {
      handleDelete(confirmModal.idToDelete);
    } else {
      handleDeleteGasto(confirmModal.idToDelete);
    }
  };

  const openGastoModal = (gasto?: any) => {
    setGastoToEdit(gasto || null);
    setIsGastoModalOpen(true);
  };

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);
  };

  const handleTcBlur = async () => {
    setIsEditingTc(false);
    const newTc = parseFloat(tcLocal);
    if (isNaN(newTc) || newTc <= 0 || newTc === entrada.tipoCambio) {
      setTcLocal(entrada.tipoCambio.toString());
      return;
    }
    
    try {
      await fetch(`/api/entradas/${entrada.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoCambio: newTc })
      });
      router.refresh();
    } catch (e) {
      console.error("Error al actualizar tipo de cambio", e);
    }
  };

  const handleShareWhatsApp = () => {
    const fechaFormat = new Date(entrada.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const emojiResumen = String.fromCodePoint(0x1F4CB);
    const emojiFecha = String.fromCodePoint(0x1F4C5);
    const emojiIngresos = String.fromCodePoint(0x1F4B5);
    const emojiGastos = String.fromCodePoint(0x1F4C9);
    const emojiDistrib = String.fromCodePoint(0x1F4CA);
    const emojiFondo = String.fromCodePoint(0x1F4B0);

    let text = `${emojiResumen} *Resumen de Entrada*\n${emojiFecha} Fecha: ${fechaFormat}\n\n`;
    text += `${emojiIngresos} *Ingresos Base:* ${formatearMonto(sumDiezmosOfrendas)}\n`;
    
    const totalGastos = gastosIngreso + gastosDiezmo + gastosNacional + gastosMisiones + gastosEventos + gastosPastor;
    if (totalGastos > 0) {
      text += `${emojiGastos} *Gastos Registrados:* -${formatearMonto(totalGastos)}\n`;
      entrada.gastos.forEach((g: any) => {
        text += `   ~ ${g.cuenta} (${g.concepto}): -${formatearMonto(g.importe)}\n`;
      });
    }

    if (otrosKeys.length > 0) {
      text += `\n*Otros Rubros:*\n`;
      otrosKeys.forEach((key) => {
        const mxn = otrosAgrupados[key].mxn;
        const usd = otrosAgrupados[key].usd;
        if (mxn > 0) text += `- ${key}: ${formatearMonto(mxn)}\n`;
        if (usd > 0) text += `- ${key}: $${usd.toFixed(2)} USD\n`;
      });
    }
    
    text += `\n${emojiDistrib} *Distribución Final:*\n`;
    if (aguinaldo) {
      text += `- Aguinaldo Pastor: $100.00\n`;
    }
    text += `- 10% Diezmo: ${formatearMonto(t10pdiezmo)}\n`;
    text += `- 3% Viña Nacional: ${formatearMonto(t3pnacional)}\n`;
    text += `- Misiones (10%): ${formatearMonto(t10pmisiones)}\n`;
    text += `- Eventos (5%): ${formatearMonto(t5peventos)}\n`;
    text += `- Pastor: ${formatearMonto(totalfinalpastor)}\n`;
    
    text += `\n${emojiFondo} *Fondo General (Ingreso Neto):* ${formatearMonto(ingreso)}\n`;

    const url = `https://api.whatsapp.com/send/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="page-header" style={{ marginBottom: '2rem', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/entradas" className="btn btn-dark" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <ChevronLeft size={24} />
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h1 className="text-3xl font-bold" style={{ textTransform: 'capitalize', lineHeight: '1.2' }}>
              {new Date(entrada.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              Tipo de Cambio:
              {isEditingTc ? (
                <input 
                  type="number" 
                  step="0.01" 
                  value={tcLocal} 
                  onChange={(e) => setTcLocal(e.target.value)}
                  onBlur={handleTcBlur}
                  autoFocus
                  className="input-field" 
                  style={{ padding: '0.2rem 0.5rem', width: '80px', height: '28px', color: 'var(--accent-primary)', fontWeight: 'bold' }}
                />
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="text-accent-primary font-bold">${entrada.tipoCambio}</span>
                  <button onClick={() => setIsEditingTc(true)} className="btn-link" title="Editar" style={{ color: 'var(--text-secondary)' }}><Edit2 size={14} /></button>
                </span>
              )}
              | Elaborado por: {entrada.elaboradoPor}
            </div>
          </div>
        </div>
        <div className="header-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={handleShareWhatsApp} className="btn btn-secondary" style={{ gap: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
            <Share2 size={18} />
            Compartir
          </button>
          <button onClick={() => openGastoModal()} className="btn btn-secondary" style={{ gap: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <Receipt size={18} />
            Registrar Gasto
          </button>
        </div>
      </div>

      <div className="responsive-detail-grid">
        
        {/* Lado Izquierdo: Formulario y Tabla */}
        <div>
          <form onSubmit={handleSubmit} className="glass-panel p-8 mb-8">
            <datalist id="nombres-list">
              {nombresUnicos.map(n => <option key={n} value={n} />)}
            </datalist>
            <datalist id="conceptos-list">
              {otrosKeys.map(k => <option key={k} value={k} />)}
            </datalist>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', fontSize: '1.25rem' }}>Capturar Nuevo Registro</h3>
            {error && <div className="text-danger mb-4">{error}</div>}
            
            <div className="input-group mb-4">
              <label>Nombre / Familia</label>
              <input type="text" id="nombre-input" name="nombre" list="nombres-list" value={formData.nombre} onChange={handleChange} className="input-field" required autoFocus />
            </div>
            
            <div className="responsive-grid mb-4">
              <div className="input-group">
                <label>Diezmo</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                    <input type="number" step="0.01" name="diezmo" value={formData.diezmo} onChange={handleChange} className="input-field" style={{ width: '100%', paddingLeft: '2rem' }} placeholder="0.00" />
                  </div>
                  <div style={{ width: '90px' }}>
                    <Select
                      id="monedaDiezmo"
                      name="monedaDiezmo"
                      value={formData.monedaDiezmo}
                      onChange={handleChange as any}
                      options={[
                        { value: "MXN", label: "MXN" },
                        { value: "USD", label: "USD" }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>Ofrenda</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                    <input type="number" step="0.01" name="ofrenda" value={formData.ofrenda} onChange={handleChange} className="input-field" style={{ width: '100%', paddingLeft: '2rem' }} placeholder="0.00" />
                  </div>
                  <div style={{ width: '90px' }}>
                    <Select
                      id="monedaOfrenda"
                      name="monedaOfrenda"
                      value={formData.monedaOfrenda}
                      onChange={handleChange as any}
                      options={[
                        { value: "MXN", label: "MXN" },
                        { value: "USD", label: "USD" }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Otros Rubros */}
            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>Otros Rubros</h4>
                <button 
                  type="button" 
                  onClick={() => setOtros([...otros, { id: Date.now(), tipo: "", importe: "", moneda: "MXN" }])} 
                  className="btn-link text-accent-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
                >
                  <Plus size={14} /> Agregar Rubro
                </button>
              </div>

              {otros.map((otro) => (
                <div key={otro.id} className="otros-rubros-grid">
                  <input 
                    type="text" 
                    list="conceptos-list"
                    value={otro.tipo} 
                    onChange={(e) => setOtros(otros.map(o => o.id === otro.id ? { ...o, tipo: e.target.value } : o))} 
                    className="input-field" 
                    placeholder="Concepto (ej. Evento)" 
                    required 
                  />
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={otro.importe} 
                      onChange={(e) => setOtros(otros.map(o => o.id === otro.id ? { ...o, importe: e.target.value } : o))} 
                      className="input-field" 
                      style={{ width: '100%', paddingLeft: '1.75rem' }} 
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                  <div>
                    <Select
                      id={`monedaOtro-${otro.id}`}
                      name={`monedaOtro-${otro.id}`}
                      value={otro.moneda}
                      onChange={(e) => setOtros(otros.map(o => o.id === otro.id ? { ...o, moneda: e.target.value } : o))}
                      options={[
                        { value: "MXN", label: "MXN" },
                        { value: "USD", label: "USD" }
                      ]}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setOtros(otros.filter(o => o.id !== otro.id))} 
                    className="btn-link text-danger flex-center" 
                    title="Quitar rubro"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '0.8rem', marginTop: '1.5rem' }}>
              <Plus size={18} style={{ marginRight: '0.5rem' }} /> {loading ? "Agregando..." : "Agregar Registro"}
            </button>
          </form>

          <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th style={{ textAlign: 'right' }}>Diezmo</th>
                  <th style={{ textAlign: 'right' }}>Ofrenda</th>
                  <th style={{ textAlign: 'right' }}>Otros</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entrada.registros.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500, verticalAlign: 'top' }}>{r.nombre}</td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                      {r.diezmo > 0 ? (
                        <>
                          <span className="font-bold">${r.diezmo.toFixed(2)}</span> <small className="text-gray-400">{r.monedaDiezmo}</small>
                          {r.monedaDiezmo === "USD" && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({formatearMonto(r.diezmo * tc)} MXN)</div>}
                        </>
                      ) : "-"}
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                      {r.ofrenda > 0 ? (
                        <>
                          <span className="font-bold">${r.ofrenda.toFixed(2)}</span> <small className="text-gray-400">{r.monedaOfrenda}</small>
                          {r.monedaOfrenda === "USD" && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({formatearMonto(r.ofrenda * tc)} MXN)</div>}
                        </>
                      ) : "-"}
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                      {r.otrosRubros && r.otrosRubros.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                          {r.otrosRubros.map((o: any) => (
                            <div key={o.id} style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{o.tipo}:</span>
                              <span><span className="font-bold">${o.importe.toFixed(2)}</span> <small className="text-gray-400">{o.moneda}</small></span>
                            </div>
                          ))}
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </td>
                    <td style={{ textAlign: 'right', width: '50px', verticalAlign: 'top' }}>
                      <button onClick={() => setConfirmModal({ isOpen: true, idToDelete: r.id, type: 'registro' })} className="btn-link text-danger" title="Eliminar"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {entrada.registros.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Aún no hay registros en esta entrada.</td>
                  </tr>
                )}
              </tbody>
              {entrada.registros.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Totales Base</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{formatearMonto(totalDiezmosMXN)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{formatearMonto(totalOfrendasMXN)}</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Lista de Gastos vinculados a esta entrada */}
          {entrada.gastos && entrada.gastos.length > 0 && (
            <div className="glass-panel mt-8" style={{ overflowX: 'auto', padding: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', padding: '0 0.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Gastos Registrados</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fondo/Cuenta</th>
                    <th>Concepto</th>
                    <th style={{ textAlign: 'right' }}>Importe</th>
                    <th style={{ textAlign: 'center' }}>Ticket</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {entrada.gastos.map((g: any) => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 500 }}>{g.cuenta}</td>
                      <td>{g.concepto}</td>
                      <td style={{ textAlign: 'right', color: 'var(--danger-primary)', fontWeight: 'bold' }}>
                        -{formatearMonto(g.importe)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {g.comprobanteUrl && (
                          <a href={g.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="btn-link" style={{ color: 'var(--accent-primary)' }} title="Ver Ticket">
                            <Receipt size={18} />
                          </a>
                        )}
                      </td>
                      <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button onClick={() => openGastoModal(g)} className="btn-link" style={{ color: 'var(--text-secondary)' }} title="Editar"><Edit2 size={16} /></button>
                        <button onClick={() => setConfirmModal({ isOpen: true, idToDelete: g.id, type: 'gasto' })} className="btn-link text-danger" title="Eliminar"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lado Derecho: Totales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Resumen de Otros Rubros (Only show if there are items) */}
          {otrosKeys.length > 0 && (
            <div className="glass-panel p-8">
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', fontSize: '1.25rem' }}>
                Resumen de Otros Rubros
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {otrosKeys.map((key) => {
                  const mxn = otrosAgrupados[key].mxn;
                  const usd = otrosAgrupados[key].usd;
                  return (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{key}</span>
                      <div style={{ textAlign: 'right' }}>
                        {mxn > 0 && <div className="font-bold text-gray-300">${mxn.toFixed(2)} <small className="text-gray-500 font-normal">MXN</small></div>}
                        {usd > 0 && <div className="font-bold text-gray-300">${usd.toFixed(2)} <small className="text-gray-500 font-normal">USD</small></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="glass-panel p-8">
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
              <span>Distribución Final</span>
            </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {aguinaldo && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Aguinaldo Pastor</span>
                <span className="font-bold text-gray-300">$100.00</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>10% Diezmo</span>
              <span className="font-bold text-gray-300">{formatearMonto(t10pdiezmo)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>3% Viña Nacional</span>
              <span className="font-bold text-gray-300">{formatearMonto(t3pnacional)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Misiones (10%)</span>
              <span className="font-bold text-gray-300">{formatearMonto(t10pmisiones)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Eventos (5%)</span>
              <span className="font-bold text-gray-300">{formatearMonto(t5peventos)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total</span>
              <span className="font-bold text-sm" style={{ color: 'var(--accent-secondary)' }}>{formatearMonto(t10pdiezmo + t3pnacional + t10pmisiones + t5peventos + (aguinaldo ? 100 : 0))}</span>
            </div>
            
            <div style={{ margin: '1rem 0', borderTop: '1px dashed rgba(255,255,255,0.2)' }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pastor</span>
                <span className="font-bold text-gray-300">{formatearMonto(tparcialpastor)}</span>
              </div>
              {apoyogasolina && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-sm" style={{ paddingLeft: '1rem', color: 'var(--text-secondary)' }}>Apoyo Gasolina</span>
                  <span className="font-bold text-sm text-gray-300">$250.00</span>
                </div>
              )}
              {apoyocelular && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-sm" style={{ paddingLeft: '1rem', color: 'var(--text-secondary)' }}>Apoyo Celular</span>
                  <span className="font-bold text-sm text-gray-300">$250.00</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total</span>
                <span className="font-bold text-sm" style={{ color: 'var(--accent-secondary)' }}>{formatearMonto(totalfinalpastor)}</span>
              </div>
            </div>

            <div style={{ margin: '1rem 0', borderTop: '1px dashed rgba(255,255,255,0.2)' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Ingreso</span>
              <span className="font-bold text-xl text-success">{formatearMonto(ingreso)}</span>
            </div>
          </div>
        </div>
        </div>

      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, idToDelete: null, type: 'registro' })} 
        onConfirm={handleConfirmDelete} 
        title={`Eliminar ${confirmModal.type === 'registro' ? 'Registro' : 'Gasto'}`} 
        message={`¿Estás seguro de que deseas eliminar este ${confirmModal.type}? Esta acción no se puede deshacer.`} 
        confirmText="Sí, eliminar" 
        cancelText="Cancelar" 
        isDanger={true} 
      />

      <GastoModal 
        isOpen={isGastoModalOpen}
        onClose={() => {
          setIsGastoModalOpen(false);
          router.refresh();
        }}
        fechaPredefinida={new Date(entrada.fecha)}
        entradaId={entrada.id}
        gastoToEdit={gastoToEdit}
      />
    </div>
  );
}
