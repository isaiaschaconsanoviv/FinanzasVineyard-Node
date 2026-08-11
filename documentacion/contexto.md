# Contexto del Proyecto: FinanzasVineyard-Node

## Descripción General
Este proyecto es una reescritura del sistema de gestión financiera "FinanzasVineyard" (anteriormente en .NET/C#) hacia un stack moderno en Node.js y React para lograr una aplicación web rápida, estética y responsiva.

## Stack Tecnológico
- **Framework:** Next.js 14+ (App Router)
- **Base de Datos:** MongoDB
- **ORM:** Prisma
- **Estilos:** Vanilla CSS con variables CSS (Tema oscuro elegante con efecto *glassmorphism*)
- **Autenticación:** NextAuth.js (Auth.js) usando `CredentialsProvider` con encriptación bcrypt.
- **Iconos/Gráficas:** `lucide-react`, `recharts`

## Arquitectura de Base de Datos (Prisma Models)
- **Usuario:** `nombre`, `correo`, `usuario`, `password`, `rol`, `activo`, `lastLogin`
- **Entrada:** `fecha`, `tipoCambio`, `notas`, `elaboradoPor`
- **Registro:** (Hijo de Entrada) `nombre`, `diezmo`, `monedaDiezmo`, `ofrenda`, `monedaOfrenda`
- **OtroRubro:** (Hijo de Registro) `tipo`, `importe`, `moneda`
- **Gasto:** `fecha`, `cuenta`, `concepto`, `importe`

---

## Historial de Cambios Cronológico

### 2026-08-10 - Setup Inicial y Fase 2 (UI + Auth)
- **Inicialización:** Proyecto Next.js configurado con Prisma y MongoDB.
- **Autenticación:** Implementado NextAuth.js (Login con credenciales). Se modificó la sesión para incluir el nombre real del usuario.
- **Interfaz (Layout):** Creación del Layout principal (Dashboard) con Sidebar interactivo utilizando íconos de `lucide-react`. 
- **Estilos:** Implementado un sistema de diseño premium (modo oscuro, glassmorphism, botones sin subrayado) centralizado en `globals.css`.
- **Módulo Usuarios:** Construido el submódulo de Configuración -> Usuarios. Incluye un listado con estilos de tabla (`.data-table`) y una pantalla protegida para que solo un ADMIN pueda crear nuevos usuarios.
- **Dashboard Principal:** Creadas las tarjetas de resumen (Entradas, Gastos, Balance).
- **Integración API Externa:** Integración con la API pública de *Frankfurter* para consultar el Tipo de Cambio (USD a MXN) actual y graficar el historial de las últimas 4 semanas (usando `recharts`). Se configuró para manejar correctamente los fines de semana (buscando la tasa del viernes).
- **Branding:** Integrados los logos oficiales de la iglesia (SVG y PNG) en el Sidebar, la página de Login y el Favicon.
