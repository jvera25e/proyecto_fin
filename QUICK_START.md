# 🚀 Guía Rápida de Configuración de JEVV con Supabase

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: JEVV
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Elige el más cercano a ti
4. Espera 2-3 minutos mientras se crea el proyecto

## Paso 2: Ejecutar el Script SQL

1. En tu proyecto de Supabase, ve al menú lateral y haz clic en **SQL Editor**
2. Haz clic en **New Query**
3. Abre el archivo `scripts/complete_setup.sql` de tu proyecto JEVV
4. Copia **TODO** el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **Run** (botón verde abajo a la derecha)
7. Deberías ver el mensaje "Success. No rows returned"

✅ Si ves este mensaje, ¡las tablas se crearon correctamente!

## Paso 3: Obtener Credenciales de Supabase

1. En el menú lateral de Supabase, haz clic en **Project Settings** (ícono de engranaje)
2. Haz clic en **API** en el menú lateral
3. Copia los siguientes valores:

   - **Project URL**: algo como `https://xxxxx.supabase.co`
   - **anon/public key**: un token largo que empieza con `eyJ...`

## Paso 4: Configurar Variables de Entorno

1. Abre el archivo `.env.local` en la raíz de tu proyecto JEVV
2. Reemplaza los valores vacíos con tus credenciales:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth Configuration (genera un secret aleatorio)
NEXTAUTH_SECRET=genera-uno-aleatorio-aqui
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (opcional por ahora)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Generar NEXTAUTH_SECRET

En tu terminal, ejecuta:
```bash
openssl rand -base64 32
```

O usa este generador online: https://generate-secret.vercel.app/32

## Paso 5: Configurar Google OAuth (Opcional)

Si quieres login con Google:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth 2.0 Client ID**
5. Configura:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/api/auth/callback/google`
     - `https://xxxxx.supabase.co/auth/v1/callback`
6. Copia el **Client ID** y **Client Secret**
7. En Supabase:
   - Ve a **Authentication** > **Providers**
   - Activa **Google**
   - Pega el Client ID y Client Secret
   - Guarda los cambios

## Paso 6: Iniciar la Aplicación

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ✅ Verificar que Todo Funciona

1. Haz clic en "Crear Cuenta Gratis"
2. Regístrate con un email y contraseña
3. Deberías ver el dashboard

Para verificar que los datos se guardan en Supabase:
1. Ve a Supabase > **Table Editor**
2. Deberías ver las tablas: `profiles`, `transactions`, `financial_goals`, `cards`
3. Haz clic en `profiles` y deberías ver tu usuario

## 🐛 Solución de Problemas

### Error: "relation public.profiles does not exist"
- **Solución**: Ejecuta el script SQL completo en Supabase SQL Editor

### Error: "Invalid API key"
- **Solución**: Verifica que copiaste correctamente las credenciales de Supabase en `.env.local`

### Error: "NEXTAUTH_SECRET is not set"
- **Solución**: Genera un secret con `openssl rand -base64 32` y agrégalo al `.env.local`

### La app no se conecta a Supabase
- **Solución**: 
  1. Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)
  2. Verifica que no haya espacios extra en las variables del `.env.local`
  3. Asegúrate de que el archivo se llame exactamente `.env.local`

## 📞 Necesitas Ayuda?

Si sigues teniendo problemas, revisa:
- La consola del navegador (F12) para ver errores
- Los logs del terminal donde corre `npm run dev`
- El archivo `SUPABASE_SETUP.md` para instrucciones más detalladas
