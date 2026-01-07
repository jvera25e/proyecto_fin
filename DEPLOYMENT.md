# Guía de Deployment - MoneyFlow

## Preparación para Producción

### 1. Configurar Variables de Entorno

Copia `.env.example` a `.env.local` y completa los valores:

\`\`\`bash
cp .env.example .env.local
\`\`\`

#### Obtener credenciales OAuth:

**Google:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:3000/api/auth/callback/google` y `https://tu-dominio.com/api/auth/callback/google` como URIs de redirección

**Apple:**
1. Ve a [Apple Developer](https://developer.apple.com/)
2. Registra un nuevo Service ID
3. Configura Sign in with Apple
4. Agrega `https://tu-dominio.com/api/auth/callback/apple` como redirect URI

### 2. Deploy en Vercel (Recomendado)

\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
\`\`\`

#### Configurar en Vercel:
1. Conecta tu repositorio de GitHub
2. Agrega variables de entorno en Project Settings
3. Configura el dominio personalizado
4. Habilita Analytics y Speed Insights (opcional)

### 3. Deploy en Netlify

\`\`\`bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
\`\`\`

### 4. Deploy en Railway

1. Conecta tu repositorio de GitHub en [Railway](https://railway.app/)
2. Agrega PostgreSQL database
3. Configura variables de entorno
4. Deploy automático

### 5. Base de Datos

#### Opción 1: Supabase (Recomendado)
1. Crea proyecto en [Supabase](https://supabase.com/)
2. Copia la URL de conexión
3. Ejecuta los scripts SQL desde el dashboard

#### Opción 2: Neon
1. Crea database en [Neon](https://neon.tech/)
2. Copia el connection string
3. Usa el CLI para ejecutar migrations

#### Opción 3: Railway PostgreSQL
- Se configura automáticamente con el deploy

### 6. Seguridad en Producción

- [ ] Genera un `NEXTAUTH_SECRET` fuerte: `openssl rand -base64 32`
- [ ] Configura CORS correctamente
- [ ] Habilita HTTPS
- [ ] Configura Rate Limiting
- [ ] Revisa permisos de base de datos
- [ ] Configura backups automáticos

### 7. Optimizaciones

\`\`\`bash
# Analizar bundle
npm run build
npx @next/bundle-analyzer

# Optimizar imágenes
npm install sharp

# Comprimir assets
# Vercel lo hace automáticamente
\`\`\`

### 8. Monitoreo

Configura:
- Vercel Analytics
- Sentry para error tracking
- Uptime monitoring (UptimeRobot, Pingdom)

### 9. CI/CD

Crea `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
\`\`\`

### 10. Post-Deploy Checklist

- [ ] Verificar que todas las páginas cargan
- [ ] Probar login con OAuth
- [ ] Verificar autenticación biométrica
- [ ] Probar exportación de PDF
- [ ] Verificar modo oscuro
- [ ] Test en móviles
- [ ] Verificar SEO (meta tags, sitemap)
- [ ] Configurar dominio personalizado
- [ ] Configurar SSL
- [ ] Test de rendimiento (Lighthouse)

## Comandos Útiles

\`\`\`bash
# Development
npm run dev

# Build local
npm run build
npm run start

# Database
npm run db:setup
npm run db:schema
npm run db:seed

# Lint
npm run lint
\`\`\`

## Soporte

Para problemas de deployment, revisa:
- [Documentación de Next.js](https://nextjs.org/docs/deployment)
- [Documentación de Vercel](https://vercel.com/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
