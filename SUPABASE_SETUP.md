# Guía Completa de Configuración de Supabase para JEVV

## Resumen
Esta guía te ayudará a configurar completamente Supabase para tu aplicación JEVV, incluyendo autenticación, base de datos y OAuth con Google.

---

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Click en "New Project"
4. Llena los datos:
   - **Name**: JEVV
   - **Database Password**: (guárdala, la necesitarás)
   - **Region**: Elige la más cercana a ti
5. Click en "Create new project"
6. Espera 2-3 minutos mientras se crea el proyecto

---

## Paso 2: Obtener Credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) en el menú lateral
2. Click en **API**
3. Copia las siguientes credenciales:
   - **Project URL** → Esta es tu `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → Esta es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Abre tu archivo `.env.local` y añade:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

---

## Paso 3: Ejecutar el Script de Base de Datos

1. En tu proyecto de Supabase, ve a **SQL Editor** en el menú lateral
2. Click en "New query"
3. Abre el archivo `scripts/complete_setup.sql` desde tu proyecto
4. Copia TODO el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Click en "Run" (▶️)
7. Deberías ver "Success. No rows returned"

**¿Qué hace este script?**
- Crea tabla `profiles` para información de usuarios
- Crea tabla `transactions` para ingresos/gastos
- Crea tabla `financial_goals` para metas financieras
- Crea tabla `cards` para tarjetas de crédito/débito
- Configura Row Level Security (RLS) en todas las tablas
- Crea triggers automáticos para perfiles y timestamps

---

## Paso 4: Configurar Google OAuth

### 4.1 Configurar en Google Cloud Console

1. Ve a [https://console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** → **Credentials**
4. Click en **Create Credentials** → **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento:
   - User Type: External
   - App name: JEVV
   - User support email: tu email
   - Developer contact: tu email
6. Vuelve a **Credentials** → **Create Credentials** → **OAuth client ID**
7. Tipo de aplicación: **Web application**
8. Nombre: JEVV
9. **Authorized redirect URIs** (agrega ambas):
   ```
   http://localhost:3000/api/auth/callback/google
   https://tu-proyecto.supabase.co/auth/v1/callback
   ```
10. Click en **Create**
11. Copia el **Client ID** y **Client secret**

### 4.2 Configurar en Supabase

1. En tu proyecto de Supabase, ve a **Authentication** → **Providers**
2. Busca **Google** y haz click en él
3. Habilita "Google enabled"
4. Pega tu **Client ID** de Google
5. Pega tu **Client Secret** de Google
6. Click en "Save"

### 4.3 Agregar a .env.local

```env
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

---

## Paso 5: Verificar Configuración

### 5.1 Verificar Tablas

1. En Supabase, ve a **Table Editor**
2. Deberías ver estas tablas:
   - ✅ profiles
   - ✅ transactions
   - ✅ financial_goals
   - ✅ cards

### 5.2 Verificar RLS

1. Click en cualquier tabla
2. Ve a la pestaña **RLS**
3. Deberías ver políticas habilitadas (escudo verde 🛡️)

### 5.3 Probar la Aplicación

1. Inicia tu aplicación: `npm run dev`
2. Ve a `http://localhost:3000`
3. Click en "Crear cuenta gratis"
4. Regístrate con email/contraseña O con Google
5. Deberías ser redirigido al dashboard

---

## Paso 6: Variables de Entorno Completas

Tu archivo `.env.local` debería verse así:

```env
# ========================================
# SUPABASE
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# ========================================
# NEXTAUTH.JS
# ========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-uno-con-openssl-rand-base64-32

# ========================================
# GOOGLE OAUTH
# ========================================
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# ========================================
# GENERAL
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Funcionalidades Implementadas

### ✅ Autenticación
- Registro con email/contraseña usando Supabase Auth
- Login con email/contraseña
- OAuth con Google (Apple fue removido como solicitaste)
- Creación automática de perfil al registrarse
- Protección de rutas del dashboard con middleware
- Cierre de sesión

### ✅ Base de Datos
- **profiles**: Email, nombre, apellido, avatar, teléfono
- **transactions**: Tipo, monto, categoría, descripción, fecha
- **financial_goals**: Nombre, monto objetivo, monto actual, deadline
- **cards**: Nombre, número, tipo, balance, límite, fecha expiración

### ✅ Seguridad (Row Level Security)
Los usuarios SOLO pueden:
- Ver sus propios datos
- Crear sus propios registros
- Actualizar sus propios registros
- Eliminar sus propios registros

### ✅ Operaciones CRUD con Eliminación
Todas las operaciones incluyen la capacidad de eliminar datos.

---

## Ejemplos de Código

### Obtener Perfil del Usuario
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

### Crear Transacción
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('transactions')
  .insert({
    type: 'expense',
    amount: 50.00,
    category: 'comida',
    description: 'Almuerzo',
    date: new Date().toISOString()
  })
```

### Eliminar Meta Financiera
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { error } = await supabase
  .from('financial_goals')
  .delete()
  .eq('id', goalId)
```

### Actualizar Tarjeta
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('cards')
  .update({ balance: newBalance })
  .eq('id', cardId)
```

---

## Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente la `anon public` key
- Asegúrate de que no haya espacios extras al inicio o final

### Error: "Failed to fetch"
- Verifica que la URL de Supabase sea correcta
- Asegúrate de incluir `https://`

### Error: "row-level security policy"
- Verifica que ejecutaste el script `complete_setup.sql`
- Ve a Table Editor → tu tabla → RLS y verifica que las políticas estén habilitadas

### Google OAuth no funciona
- Verifica que las redirect URIs estén correctamente configuradas
- Asegúrate de usar las mismas credenciales en Google Console y Supabase

### No se crea el perfil automáticamente
- Verifica que el trigger `on_auth_user_created` existe
- Ve a Database → Functions y verifica que `handle_new_user()` existe

---

## Para Producción (Deployment)

Cuando despliegues a Vercel/Netlify:

1. Agrega las variables de entorno en el dashboard de tu proveedor
2. Actualiza `NEXTAUTH_URL` a tu dominio real
3. Actualiza `NEXT_PUBLIC_APP_URL` a tu dominio real
4. En Google Console, agrega tu dominio de producción a las redirect URIs:
   ```
   https://tu-dominio.com/api/auth/callback/google
   ```
5. En Supabase Auth Settings, agrega tu dominio a "Site URL" y "Redirect URLs"

---

## Listo! 🎉

Tu aplicación JEVV ahora está completamente conectada a Supabase con:
- ✅ Autenticación segura
- ✅ Base de datos con RLS
- ✅ OAuth con Google
- ✅ Operaciones CRUD completas
- ✅ Capacidad de eliminar datos

Puedes empezar a usar la aplicación ejecutando:
```bash
npm run dev
```

Y visitar: `http://localhost:3000`
