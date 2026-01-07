# Checklist de Producción

Antes de deployar a producción, verifica estos puntos:

## Seguridad

- [ ] Generar `NEXTAUTH_SECRET` seguro (usa `openssl rand -base64 32`)
- [ ] Configurar todas las variables de entorno en el hosting
- [ ] Habilitar HTTPS (obligatorio para biometría)
- [ ] Configurar CORS correctamente
- [ ] Revisar permisos de base de datos
- [ ] Cambiar credenciales de base de datos por las de producción
- [ ] Eliminar logs de debug y console.log innecesarios
- [ ] Revisar que no haya secrets en el código

## OAuth

- [ ] Configurar Google OAuth con dominio de producción
- [ ] Configurar Apple OAuth con dominio de producción
- [ ] Agregar URIs de callback de producción
- [ ] Verificar dominios autorizados

## Base de Datos

- [ ] Crear base de datos de producción (Neon, Supabase, Railway)
- [ ] Ejecutar migraciones: `npm run db:schema`
- [ ] Configurar backups automáticos
- [ ] Configurar connection pooling
- [ ] Revisar índices de base de datos

## Performance

- [ ] Ejecutar `npm run build` localmente para verificar
- [ ] Optimizar imágenes
- [ ] Configurar CDN (si es necesario)
- [ ] Habilitar compresión
- [ ] Configurar caché de assets

## Testing

- [ ] Probar registro de usuarios
- [ ] Probar login con email/password
- [ ] Probar login con Google
- [ ] Probar login con Apple
- [ ] Probar captura biométrica
- [ ] Probar todas las páginas principales
- [ ] Probar en diferentes navegadores
- [ ] Probar en dispositivos móviles
- [ ] Probar modo oscuro

## Monitoreo

- [ ] Configurar error tracking (Sentry recomendado)
- [ ] Configurar analytics
- [ ] Configurar uptime monitoring
- [ ] Configurar alertas de errores

## DNS y Dominio

- [ ] Configurar dominio personalizado
- [ ] Configurar SSL/TLS
- [ ] Verificar registros DNS
- [ ] Configurar redirección www/no-www

## Documentación

- [ ] Actualizar README.md
- [ ] Documentar variables de entorno
- [ ] Documentar proceso de deployment
- [ ] Documentar troubleshooting común

## Legal

- [ ] Agregar política de privacidad
- [ ] Agregar términos de servicio
- [ ] Cumplir con GDPR (si aplica)
- [ ] Agregar banner de cookies (si aplica)

## Post-Deployment

- [ ] Verificar que la app funciona en producción
- [ ] Probar todas las funcionalidades críticas
- [ ] Revisar logs de errores
- [ ] Monitorear performance
- [ ] Notificar a usuarios (si aplica)
