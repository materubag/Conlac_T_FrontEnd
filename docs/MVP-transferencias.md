# MVP: transferencias y persistencia central

El frontend usa Spring Boot para catálogo, recetas, asociaciones, turismo, testimonios, pedidos, capacitación y configuración editable. SQLite ya no participa en las rutas de la aplicación; `src/lib/db/sqlite.ts` se conserva únicamente para consultar respaldos antiguos.

## Preparar la base de datos existente

Aplicar `conlact-backend/supabase/migrations/20261105_mvp_content.sql` sobre la base PostgreSQL usada por Spring Boot, antes de iniciar esta versión. Por ejemplo, desde el directorio del backend:

```powershell
Get-Content -Raw supabase/migrations/20261105_mvp_content.sql | docker compose exec -T postgres psql -U postgres -d conlact_local -v ON_ERROR_STOP=1
```

Usar el nombre real del servicio y las credenciales del despliegue. Los volúmenes nuevos ejecutan también `docker/init/06_mvp_content.sql`; los volúmenes existentes necesitan aplicar la migración explícitamente. No eliminar el volumen para migrar.

## Configuración

Copiar las variables de `.env.example` a `.env.local`. Completar banco, tipo y número de cuenta, beneficiario, RUC, correo de pagos y WhatsApp institucional con valores verificados. Los valores incompletos muestran una indicación para consultar al consorcio; no se usan los números ficticios del documento de pendientes.

Configurar `BACKEND_API_URL` para las lecturas del servidor y `NEXT_PUBLIC_BACKEND_URL` para las llamadas desde el navegador. Ambas incluyen `/api`.

El acceso administrativo usa `POST /api/auth/login`, Supabase Auth y el rol de la tabla `profiles`. Las antiguas credenciales simuladas del navegador ya no dan acceso. Para habilitar registro de clientes configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. El checkout permite compras como invitado.

Configurar Supabase Storage en el backend para subir imágenes. Se admiten JPEG, PNG y WebP de hasta 5 MB. Configurar SMTP y `MAIL_ENABLED=true` para notificaciones reales; el formulario de contacto ya persiste los mensajes en el backend.

Si Storage responde `Invalid Compact JWS` o exige la cabecera `authorization`, el proyecto de Supabase está requiriendo un JWT para ese endpoint. Configurar en `conlact-backend/.env` la clave `service_role` JWT del mismo proyecto (empieza con `eyJ...`) como `SUPABASE_SERVICE_ROLE_KEY`, desde Settings → API Keys → Legacy API Keys. No usar la clave pública `anon` para reemplazarla. Recrear el backend con `docker compose up -d --force-recreate backend`. Las claves privadas se mantienen únicamente en el backend.

## Ejecutar con Docker

Ejecutar `docker compose up -d --build` dentro de `conlact-backend` y repetirlo dentro de `Conlac_T_FrontEnd`. Cada proyecto lee su propio `.env`.

Abrir `http://localhost:3000` para la tienda y `http://localhost:8080/actuator/health` para comprobar el backend. No ejecutar `npm run dev` si el frontend ya está iniciado con Docker.

En el frontend, `NEXT_PUBLIC_BACKEND_URL=http://localhost:8080/api` es la dirección del navegador. Las lecturas dentro del contenedor usan `http://host.docker.internal:8080/api`; se puede cambiar con `DOCKER_BACKEND_API_URL` para otro despliegue.

Después de cambiar las variables públicas de banco, WhatsApp o Supabase, reconstruir el frontend con `docker compose up -d --build`.

## Operación

En `/tienda`, el administrador crea y edita productos con el modal. Cada presentación mantiene SKU, peso, precio, stock, actividad y versión. El guardado de producto e inventario es transaccional. El administrador puede consultar también borradores y productos ocultos.

El checkout solo crea transferencias. Las zonas y tarifas provienen de PostgreSQL, y Spring recalcula precios y totales. El cliente envía el comprobante por WhatsApp con el número y monto del pedido; el enlace abre el chat y el cliente adjunta el archivo allí.

En `/administracion/pedidos` se filtran pedidos, consultan cliente e ítems, registra la referencia bancaria, confirma la verificación del abono, actualiza el estado y descarga CSV. La secuencia operativa es pendiente, pagado, preparación, enviado y completado. La cancelación devuelve las unidades reservadas. Los endpoints administrativos requieren JWT y rol admin.

El inventario se reserva al crear el pedido y se consume al aprobar el pago, sin descontarlo dos veces. La reserva dura 48 horas por defecto (`ORDER_RESERVATION_MINUTES=2880`), para permitir conciliación manual. El checkout muestra el vencimiento. Se mantiene el servicio de liberación de reservas del backend existente.

Las páginas editables sincronizan turismo, asociaciones y testimonios con las entidades centrales. Los testimonios nuevos requieren marcar autorización de publicación en el editor. Las recetas conservan pasos, ingredientes y videos; los administradores pueden cargar borradores sin mostrarlos al público.

## Importar un respaldo SQLite anterior

Esta copia del proyecto no incluía `data/contenidos.db`. Si existe un respaldo en otra instalación, aplicar primero la migración SQL, obtener un JWT administrativo e importarlo con Node 24 o superior:

```powershell
$env:CONLACT_ADMIN_TOKEN = '<JWT administrativo>'
node scripts/migrate-content.mjs 'C:\ruta\contenidos.db'
Remove-Item Env:CONLACT_ADMIN_TOKEN
```

El importador abre el original en modo lectura. Ejecutarlo sobre una base respaldada y verificar el catálogo y contenido resultante. No elimina recetas centrales ausentes del respaldo. Los productos ya existentes se reconocen por slug; no se sobrescribe su inventario.

## Verificación

Frontend: `npm ci`, `npm run lint`, `npm run build`.

Backend con Java 25: `mvn test`. Las pruebas de integración usan Testcontainers y requieren Docker disponible. Para las pruebas unitarias: `mvn "-Dtest=!*IntegrationTest,!ConlactBackendApplicationTests,!MigrationIntegrityTest" test`.
