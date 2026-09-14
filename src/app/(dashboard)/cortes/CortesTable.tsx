"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

export default function CortesTable({ cortes }: { cortes: any[] }) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
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
              <th>Fecha del Corte</th>
              <th className="hide-on-mobile">Elaborado Por</th>
              <th className="hide-on-mobile">Notas</th>
              <th style={{ textAlign: 'right' }}>Total Físico (MXN)</th>
              <th style={{ textAlign: 'right' }}>Diferencia Total</th>
              <th className="hide-on-mobile" style={{ textAlign: 'center', width: '80px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cortes.map((corte) => {
              const totalFisico = corte.registros.reduce((sum: number, r: any) => sum + r.saldoFisico, 0);
              const totalDiferencia = corte.registros.reduce((sum: number, r: any) => sum + r.diferencia, 0);
              const isExpanded = expandedRows[corte.id];

              return (
                <React.Fragment key={corte.id}>
                  <tr className="clickable-row" onClick={() => toggleRow(corte.id)}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="mobile-only-icon" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                        {new Date(corte.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="hide-on-mobile">{corte.elaboradoPor}</td>
                    <td className="hide-on-mobile" style={{ color: 'var(--text-secondary)' }}>{corte.notas || '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="text-accent">
                      ${totalFisico.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }} className={totalDiferencia < 0 ? "text-danger" : totalDiferencia > 0 ? "text-accent" : "text-muted"}>
                      {totalDiferencia > 0 ? '+' : ''}{totalDiferencia === 0 ? '-' : `$${totalDiferencia.toFixed(2)}`}
                    </td>
                    <td className="hide-on-mobile" style={{ textAlign: 'center' }}>
                      <Link href={`/cortes/${corte.id}`} onClick={e => e.stopPropagation()} className="text-gray-400 hover:text-white transition-colors" title="Ver Detalle">
                        <Eye size={20} style={{ display: 'inline' }} />
                      </Link>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="mobile-expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <td colSpan={3} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-gray-400 text-sm">Elaborado Por:</span>
                            <span>{corte.elaboradoPor}</span>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-gray-400 text-sm">Notas:</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{corte.notas || '-'}</span>
                          </div>
                          
                          <div style={{ display: 'flex', marginTop: '0.5rem' }}>
                            <Link href={`/cortes/${corte.id}`} className="btn btn-primary btn-sm flex-1" style={{ padding: '0.5rem', justifyContent: 'center', textAlign: 'center' }}>
                              Ver Detalle
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {cortes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aún no se ha realizado ningún corte de caja.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
