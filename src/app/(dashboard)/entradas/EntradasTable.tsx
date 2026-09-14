"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function EntradasTable({ entradas }: { entradas: any[] }) {
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
              <th>Fecha del Servicio</th>
              <th style={{ textAlign: 'right' }}>Tasa de Cambio</th>
              <th style={{ textAlign: 'right' }}>Ingreso Neto</th>
              <th className="hide-on-mobile">Elaborado Por</th>
              <th className="hide-on-mobile"></th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((entrada) => {
              const isExpanded = expandedRows[entrada.id];
              return (
                <React.Fragment key={entrada.id}>
                  <tr className="clickable-row" onClick={() => toggleRow(entrada.id)}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="mobile-only-icon" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                        {new Date(entrada.fecha).toLocaleDateString('es-MX', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>${entrada.tipoCambio.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="text-success">
                      ${entrada.ingreso.toFixed(2)} MXN
                    </td>
                    <td className="hide-on-mobile">{entrada.elaboradoPor}</td>
                    <td className="hide-on-mobile" style={{ textAlign: 'right' }}>
                      <Link href={`/entradas/${entrada.id}`} onClick={e => e.stopPropagation()} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Ver / Editar</Link>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="mobile-expanded-row" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <td colSpan={3} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-gray-400 text-sm">Elaborado por:</span>
                            <span>{entrada.elaboradoPor}</span>
                          </div>
                          
                          <div style={{ display: 'flex', marginTop: '0.5rem' }}>
                            <Link href={`/entradas/${entrada.id}`} className="btn btn-primary btn-sm flex-1" style={{ padding: '0.5rem', justifyContent: 'center', textAlign: 'center' }}>
                              Ver / Editar
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {entradas.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No hay entradas registradas. Presiona "Nueva Entrada" para comenzar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
