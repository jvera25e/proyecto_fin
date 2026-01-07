# 🔐 Guía de Configuración de Variables de Entorno

Esta guía te ayudará a obtener todas las keys necesarias para desplegar tu aplicación financiera.

## 📋 Variables Requeridas vs Opcionales

### ✅ REQUERIDAS (mínimo para funcionar)
- `NEXTAUTH_SECRET` - Para autenticación
- `NEXTAUTH_URL` - URL de tu app

### 🔄 OPCIONALES (para funcionalidades extra)
- `DATABASE_URL` - Si quieres persistir datos
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` - Login con Google
- `APPLE_CLIENT_ID` y `APPLE_CLIENT_SECRET` - Login con Apple

---

## 1️⃣ NEXTAUTH_SECRET (REQUERIDO)

Esta es la clave más importante para la seguridad de tu app.

### Cómo generarla:

**Opción A: En tu terminal (Linux/Mac/Git Bash)**
```bash
openssl rand -base64 32
```

**Opción B: En Node.js**
```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Opción C: Generador online**
Ve a: https://generate-secret.vercel.app/32

Copia el resultado y pégalo en tu `.env.local`:
```env
NEXTAUTH_SECRET=tu-secreto-generado-aqui-debe-ser-largo-y-aleatorio
```

---

## 2️⃣ NEXTAUTH_URL (REQUERIDO)

Esta es la URL donde corre tu aplicación.

### Para desarrollo local:
```env
NEXTAUTH_URL=http://localhost:3000
```

### Para producción (después de desplegar):
```env
NEXTAUTH_URL=https://tu-app.vercel.app
```

---

## 3️⃣ DATABASE_URL (Opcional pero recomendado)

Para guardar datos de usuarios, transacciones, etc.

### Opción A: Supabase (RECOMENDADO - Gratis)

1. Ve a https://supabase.com/
2. Crea una cuenta gratis
3. Click en "New Project"
4. Completa el formulario:
   - Name: financial-app
   - Database Password: (crea una segura)
   - Region: (elige la más cercana)
5. Espera 2-3 minutos mientras se crea
6. Ve a "Settings" > "Database"
7. Copia el "Connection String" (URI)
8. Pégalo en tu `.env.local`:

```env
DATABASE_URL=postgresql://postgres:[TU-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### Opción B: Neon (Alternativa gratis)

1. Ve a https://neon.tech/
2. Crea una cuenta gratis
3. Click en "Create a Project"
4. Copia el "Connection String"
5. Pégalo en tu `.env.local`

### Opción C: PostgreSQL Local (Para desarrollo)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/financial_app
```

---

## 4️⃣ GOOGLE OAUTH (Opcional)

Para que los usuarios puedan hacer login con Google.

### Pasos:

1. Ve a https://console.cloud.google.com/
2. Crea un proyecto nuevo:
   - Click en el selector de proyectos (arriba)
   - Click "New Project"
   - Nombre: "Financial App"
   - Click "Create"

3. Habilita Google+ API:
   - En el menú, ve a "APIs & Services" > "Library"
   - Busca "Google+ API"
   - Click "Enable"

4. Configura OAuth consent screen:
   - Ve a "APIs & Services" > "OAuth consent screen"
   - Selecciona "External"
   - Completa:
     - App name: Financial App
     - User support email: tu-email@gmail.com
     - Developer contact: tu-email@gmail.com
   - Click "Save and Continue"
   - Scopes: deja los defaults
   - Test users: agrega tu email
   - Click "Save and Continue"

5. Crea credenciales OAuth:
   - Ve a "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: Financial App Web
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click "Create"

6. Copia las credenciales:
   - Client ID: empieza con `xxxxx.apps.googleusercontent.com`
   - Client secret: string aleatorio

7. Pégalas en tu `.env.local`:
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

### Para producción (después de desplegar):
- Vuelve a "Credentials"
- Edita tu OAuth client
- Agrega a "Authorized redirect URIs":
  ```
  https://tu-app.vercel.app/api/auth/callback/google
  ```

---

## 5️⃣ APPLE OAUTH (Opcional - Avanzado)

⚠️ Requiere una cuenta de Apple Developer ($99/año)

Si no tienes cuenta de desarrollador de Apple, puedes saltarte esto.

### Pasos (si tienes cuenta):

1. Ve a https://developer.apple.com/account
2. Ve a "Certificates, Identifiers & Profiles"
3. Click "Identifiers" > "+" (nuevo)
4. Selecciona "App IDs" > Continue
5. Selecciona "App" > Continue
6. Configura:
   - Description: Financial App
   - Bundle ID: com.tudominio.financialapp
   - Marca "Sign in with Apple"
7. Click "Continue" > "Register"

8. Crea un Service ID:
   - Vuelve a Identifiers > "+" > "Services IDs"
   - Identifier: com.tudominio.financialapp.service
   - Description: Financial App Service
   - Marca "Sign in with Apple"
   - Click "Configure"
   - Domains: tu-dominio.vercel.app
   - Return URLs: https://tu-dominio.vercel.app/api/auth/callback/apple
   - Click "Save" > "Continue" > "Register"

9. Crea una Key:
   - Ve a "Keys" > "+" (nuevo)
   - Key Name: Financial App Sign In Key
   - Marca "Sign in with Apple"
   - Click "Configure" > selecciona tu App ID
   - Click "Save" > "Continue" > "Register"
   - DESCARGA el archivo .p8 (solo se muestra una vez)
   - Anota el Key ID

10. Agrega a tu `.env.local`:
```env
APPLE_CLIENT_ID=com.tudominio.financialapp.service
APPLE_CLIENT_SECRET=(requiere generar JWT con la key .p8)
```

---

## 🚀 Desplegar en Vercel

Una vez que tengas tu `.env.local` configurado:

### 1. Instala Vercel CLI:
```bash
npm install -g vercel
```

### 2. Login en Vercel:
```bash
vercel login
```

### 3. Despliega:
```bash
vercel
```

### 4. Configura las variables en Vercel:
```bash
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add DATABASE_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
```

O desde el dashboard de Vercel:
1. Ve a tu proyecto en https://vercel.com
2. Settings > Environment Variables
3. Agrega cada variable una por una

### 5. Redespliega con las nuevas variables:
```bash
vercel --prod
```

---

## ✅ Checklist Final

Antes de desplegar, verifica que tienes:

- [ ] `NEXTAUTH_SECRET` generado
- [ ] `NEXTAUTH_URL` configurado
- [ ] `.env.local` creado con tus keys
- [ ] (Opcional) Base de datos configurada
- [ ] (Opcional) Google OAuth configurado
- [ ] `.env` y `.env.local` en tu `.gitignore`
- [ ] Código funcionando en local (`npm run dev`)

---

## 🆘 Solución de Problemas

### Error: "NEXTAUTH_SECRET is not defined"
- Genera un secret y agrégalo al `.env.local`
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "Invalid callback URL"
- Verifica que las URLs en Google Console coincidan exactamente
- Asegúrate de incluir `/api/auth/callback/google` al final

### Base de datos no se conecta
- Verifica que el `DATABASE_URL` sea correcto
- Asegúrate que tu IP esté permitida en Supabase/Neon
- Revisa que el password no tenga caracteres especiales sin escapar

---

## 📞 Ayuda Adicional

Si tienes problemas:
1. Revisa los logs: `npm run dev` en tu terminal
2. Verifica que todas las URLs estén correctas
3. Asegúrate de reiniciar el servidor después de cambiar `.env.local`
4. Consulta la documentación oficial:
   - NextAuth: https://next-auth.js.org/
   - Vercel: https://vercel.com/docs
   - Supabase: https://supabase.com/docs
