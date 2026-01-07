# FinanceApp - Plataforma de Gestión Financiera Inteligente

Una aplicación web moderna y segura para la gestión de finanzas personales con autenticación biométrica, análisis con IA y reportes avanzados.

## Características Principales

### Seguridad Avanzada
- **Autenticación Biométrica** con reconocimiento facial
- **OAuth 2.0** con Google y Apple
- **Sesiones seguras** con NextAuth.js
- **Encriptación** de datos sensibles

### Dashboard Financiero
- Resumen en tiempo real de balance, ingresos y gastos
- Gráficos interactivos con Recharts
- Métricas y KPIs financieros
- Modo oscuro/claro

### Gestión Completa
- Transacciones con categorización automática
- Presupuestos inteligentes con alertas
- Metas financieras con seguimiento
- Múltiples cuentas bancarias
- Reportes exportables a PDF

### Inteligencia Artificial
- Análisis de patrones de gasto
- Recomendaciones personalizadas
- Predicciones financieras
- Asistente de chat interactivo

## Tecnologías

- **Frontend**: Next.js 15, React 18, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui
- **Autenticación**: NextAuth.js, Web Authentication API
- **Base de Datos**: PostgreSQL (Neon/Supabase compatible)
- **Gráficos**: Recharts
- **Formularios**: React Hook Form + Zod

## Instalación Local

### Requisitos
- Node.js 18+ 
- npm 9+
- PostgreSQL (o cuenta en Neon/Supabase)

### Pasos

1. **Clonar el repositorio**
\`\`\`bash
git clone [URL_DEL_REPO]
cd financial-app
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Editar `.env.local` con tus credenciales:
\`\`\`env
DATABASE_URL=postgresql://usuario:password@localhost:5432/financial_app
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

APPLE_CLIENT_ID=tu-apple-client-id
APPLE_CLIENT_SECRET=tu-apple-client-secret
\`\`\`

4. **Configurar base de datos**
\`\`\`bash
npm run db:schema
npm run db:seed
\`\`\`

5. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

Abrir [http://localhost:3000](http://localhost:3000)

## Configuración de OAuth

### Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Agregar URIs autorizados:
   - Desarrollo: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://tu-dominio.com/api/auth/callback/google`

### Apple OAuth

1. Ir a [Apple Developer](https://developer.apple.com/)
2. Crear nuevo Service ID
3. Configurar Sign in with Apple
4. Agregar Return URLs:
   - Desarrollo: `http://localhost:3000/api/auth/callback/apple`
   - Producción: `https://tu-dominio.com/api/auth/callback/apple`

## Deployment en Producción

### Opción 1: Vercel (Recomendado)

1. **Instalar Vercel CLI**
\`\`\`bash
npm i -g vercel
\`\`\`

2. **Deployar**
\`\`\`bash
vercel
\`\`\`

3. **Configurar variables de entorno** en el dashboard de Vercel

4. **Configurar base de datos** (Neon recomendado):
\`\`\`bash
# Crear proyecto en https://neon.tech
# Copiar connection string
# Agregar a Vercel como DATABASE_URL
\`\`\`

### Opción 2: Netlify

1. Conectar repositorio de GitHub
2. Configurar build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Agregar variables de entorno
4. Deploy

### Opción 3: Railway

1. Crear cuenta en [Railway](https://railway.app)
2. Crear nuevo proyecto desde GitHub
3. Agregar PostgreSQL addon
4. Configurar variables de entorno
5. Deploy automático

## Checklist Pre-Producción

Antes de deployar, revisar [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

Puntos críticos:
- [ ] Generar `NEXTAUTH_SECRET` seguro
- [ ] Configurar OAuth con dominios de producción
- [ ] Migrar base de datos a producción
- [ ] Habilitar HTTPS (obligatorio para biometría)
- [ ] Configurar monitoreo de errores
- [ ] Probar todas las funcionalidades

## Scripts Disponibles

\`\`\`bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm start            # Servidor de producción
npm run lint         # Linter
npm run type-check   # Verificar TypeScript
npm run db:schema    # Crear tablas de base de datos
npm run db:seed      # Insertar datos de prueba
npm run db:reset     # Resetear base de datos
\`\`\`

## Estructura del Proyecto

\`\`\`
financial-app/
├── app/                    # App Router de Next.js
│   ├── api/               # API routes
│   ├── dashboard/         # Páginas del dashboard
│   ├── login/             # Autenticación
│   ├── register/          # Registro
│   └── settings/          # Configuración
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn)
│   ├── face-capture-modal.tsx
│   ├── biometric-login.tsx
│   └── ...
├── lib/                   # Utilidades
├── scripts/              # Scripts de BD
├── public/               # Assets estáticos
└── styles/               # CSS global
\`\`\`

## Uso de la Aplicación

### Registro con Biometría

1. Hacer clic en "Crear cuenta gratis"
2. Completar formulario (nombre, email, contraseña)
3. Al hacer clic en "Registrarse", se abrirá modal de captura facial
4. Permitir acceso a cámara
5. Centrar rostro en el círculo
6. Esperar captura automática (3 segundos)
7. Confirmar registro

### Login

**Opción 1: Email y Contraseña**
- Ingresar credenciales
- Verificación biométrica opcional

**Opción 2: OAuth**
- Hacer clic en "Continuar con Google" o "Continuar con Apple"
- Autorizar acceso
- Login automático

**Opción 3: Biométrica**
- Hacer clic en botón de huella/rostro
- Permitir acceso a cámara
- Autenticación automática

### Editar Perfil

1. Ir a Settings (icono engranaje)
2. Modificar datos personales
3. Cambiar foto de perfil
4. Guardar cambios

### Exportar Reportes

1. Ir a la sección Reportes
2. Hacer clic en "Descargar PDF"
3. Se genera reporte con gráficos y métricas

## Seguridad

- **HTTPS obligatorio** en producción (requerido para biometría)
- **Passwords hasheados** con bcrypt
- **Sesiones seguras** con HTTP-only cookies
- **CSRF protection** habilitado
- **Headers de seguridad** configurados
- **Rate limiting** en API routes

## Troubleshooting

### Error: "Camera not accessible"
- Verificar permisos de cámara en el navegador
- Asegurar que el sitio use HTTPS (en producción)

### Error: "OAuth callback failed"
- Verificar que las URLs de callback estén correctamente configuradas
- Revisar que las credenciales sean válidas

### Error de conexión a BD
- Verificar `DATABASE_URL` en variables de entorno
- Confirmar que la base de datos esté activa
- Revisar firewall y reglas de acceso

## Soporte

Para issues y bugs, abrir un ticket en GitHub Issues.

## Licencia

MIT License - Ver [LICENSE](./LICENSE)

---

**Desarrollado con Next.js, React y TypeScript**
