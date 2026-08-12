# FinanzasVineyard-Node

Sistema integral de gestión financiera para la iglesia, reescrito desde cero utilizando tecnologías web modernas para ofrecer una experiencia rápida, estética y responsiva.

## 🚀 Características Principales

- **Dashboard Financiero:** Tarjetas de resumen en tiempo real para el Balance General, Entradas y Gastos.
- **Distribución Automatizada:** Lógica de negocio integrada para la distribución automática de fondos (Diezmos, Viña Nacional, Pastor, Misiones, Eventos, Fondo General).
- **Gestión de Usuarios:** Módulo de administración para crear, editar y deshabilitar usuarios con control de roles (Ej. `ADMIN`).
- **Autenticación Segura:** Sistema de login mediante credenciales encriptadas (Bcrypt + NextAuth).
- **Tipo de Cambio (USD a MXN):** Integración con la API de *Frankfurter* para obtener el tipo de cambio al día y graficar el histórico de las últimas 4 semanas.
- **Gestión de Comprobantes:** Integración con *Cloudinary* para almacenar y administrar de manera segura las imágenes de los recibos y comprobantes.

## 🛠 Stack Tecnológico

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Base de Datos:** [MongoDB](https://www.mongodb.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Autenticación:** [NextAuth.js](https://next-auth.js.org/)
- **Estilos:** Vanilla CSS (Diseño Premium Dark Mode + *Glassmorphism*)
- **Iconos y Gráficas:** `lucide-react` y `recharts`
- **Almacenamiento de Imágenes:** [Cloudinary](https://cloudinary.com/)
- **Despliegue:** [Vercel](https://vercel.com/)

## 💻 Entorno de Desarrollo (Local)

Sigue estos pasos para correr el proyecto en tu máquina local:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto basado en las necesidades del sistema:
   ```env
   DATABASE_URL="mongodb+srv://<usuario>:<password>@cluster.mongodb.net/FinanzasVineyard"
   NEXTAUTH_SECRET="tu_secreto_aqui"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Cloudinary Config
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu_cloud_name"
   CLOUDINARY_API_KEY="tu_api_key"
   CLOUDINARY_API_SECRET="tu_api_secret"
   ```

3. **Sincronizar Prisma:**
   ```bash
   npx prisma generate
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📖 Documentación Interna

Para consultar el historial detallado de cambios, decisiones de arquitectura y módulos implementados fase por fase, por favor revisa la bitácora viva del proyecto:

- [Contexto y Bitácora del Proyecto](documentacion/contexto.md)
