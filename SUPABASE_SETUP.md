# Configuración de Supabase para JEVV

## Paso 1: Conectar Supabase

1. Ve a la sección "Connect" en la interfaz de v0
2. Selecciona "Supabase" de la lista de integraciones
3. Sigue las instrucciones para conectar tu proyecto de Supabase

## Paso 2: Ejecutar Scripts SQL

Los scripts en la carpeta `scripts/` crean la estructura de base de datos necesaria:

1. **001_create_profiles.sql** - Tabla de perfiles de usuario
2. **002_create_financial_tables.sql** - Tablas de transacciones, metas y tarjetas
3. **003_profile_trigger.sql** - Auto-creación de perfiles al registrarse
4. **004_updated_at_trigger.sql** - Auto-actualización de timestamps

Puedes ejecutar estos scripts directamente desde v0 o desde el editor SQL de Supabase.

## Paso 3: Variables de Entorno

Asegúrate de tener estas variables en tu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

## Paso 4: Configurar OAuth (Opcional)

Para habilitar Google OAuth:

1. Ve a Authentication > Providers en Supabase
2. Habilita el proveedor de Google
3. Agrega las credenciales de OAuth de Google Cloud Console
4. Configura las URLs de redirect autorizadas

## Funcionalidades Implementadas

### Autenticación
- Registro con email/contraseña
- Login con email/contraseña
- OAuth con Google
- Reconocimiento facial (opcional)
- Row Level Security (RLS) para proteger datos

### Base de Datos
- **profiles**: Información del usuario
- **transactions**: Ingresos y gastos
- **financial_goals**: Metas financieras
- **cards**: Tarjetas de crédito/débito

### Operaciones CRUD
Todos los datos están protegidos con RLS. Los usuarios solo pueden:
- Ver sus propios datos
- Crear nuevos registros
- Actualizar sus registros
- Eliminar sus registros

## Ejemplo de Uso

### Crear una transacción
```typescript
const supabase = createClient()
const { data, error } = await supabase
  .from('transactions')
  .insert({
    user_id: user.id,
    type: 'expense',
    amount: 50.00,
    category: 'food',
    description: 'Almuerzo',
  })
```

### Eliminar una meta
```typescript
const supabase = createClient()
const { error } = await supabase
  .from('financial_goals')
  .delete()
  .eq('id', goalId)
```

### Obtener tarjetas
```typescript
const supabase = createClient()
const { data: cards, error } = await supabase
  .from('cards')
  .select('*')
  .order('created_at', { ascending: false })
