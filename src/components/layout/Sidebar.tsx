"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Wallet, Receipt, Users, LogOut, Calculator, Settings, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import "../../app/responsive.css";

export function Sidebar({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header (Only visible on mobile) */}
      <div className="main-header glass-panel mobile-only-header">
        <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>
        <h3 className="text-white" style={{ margin: 0, fontSize: '1.1rem' }}>Bienvenido, {userName}</h3>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isOpen ? 'open' : ''}`} 
        onClick={closeMenu}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image src="/logo_blanco.png" alt="La Viña Logo" width={40} height={40} style={{ objectFit: 'contain' }} />
            <h2>Finanzas</h2>
          </div>
          <button className="mobile-menu-btn" onClick={closeMenu}>
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link href="/" className="nav-link" onClick={closeMenu}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          
          <div className="nav-category">Finanzas</div>
          <Link href="/entradas" className="nav-link" onClick={closeMenu}>
            <Wallet size={18} />
            <span>Entradas</span>
          </Link>
          <Link href="/gastos" className="nav-link" onClick={closeMenu}>
            <Receipt size={18} />
            <span>Gastos</span>
          </Link>
          <Link href="/cortes" className="nav-link" onClick={closeMenu}>
            <Calculator size={18} />
            <span>Cortes de Caja</span>
          </Link>
          
          <div className="nav-category">Configuración</div>
          <Link href="/configuracion" className="nav-link" onClick={closeMenu}>
            <Settings size={18} />
            <span>Motor de Reglas</span>
          </Link>
          <Link href="/usuarios" className="nav-link" onClick={closeMenu}>
            <Users size={18} />
            <span>Usuarios</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <Link href="/api/auth/signout" className="nav-link text-danger">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
