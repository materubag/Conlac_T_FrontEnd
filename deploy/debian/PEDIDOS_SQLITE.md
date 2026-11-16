# Pedidos, stock e imágenes en SQLite

Actualización del 16/11/2026. Los nuevos pedidos utilizan la misma SQLite que administra el catálogo. No se modifican los pedidos ni las reservas anteriores de Java/PostgreSQL.

## Actualizar en Debian

Desde `/opt/docker/conlact/Conlac_T_FrontEnd/deploy/debian`, crear primero un respaldo consistente. No copiar solamente el `.db` mientras hay escritores activos: puede haber datos en WAL.

```bash
umask 077
mkdir -p backups
sudo docker compose exec -T frontend node -e 'const {DatabaseSync,backup}=require("node:sqlite"); const db=new DatabaseSync("/app/data/contenidos.db",{readOnly:true}); backup(db,"/tmp/contenidos-antes-pedidos.db").then(()=>db.close()).catch(e=>{db.close();console.error(e.message);process.exitCode=1});'
sudo docker compose cp frontend:/tmp/contenidos-antes-pedidos.db "backups/contenidos-$(date +%Y%m%d-%H%M%S).db"
```

Si el respaldo falla, resolverlo antes de continuar. Guardar una copia privada fuera del servidor.

```bash
cd /opt/docker/conlact/Conlac_T_FrontEnd
git pull --ff-only origin develop
cd deploy/debian
sudo docker compose config --quiet
sudo docker compose build frontend
sudo docker compose up -d --wait --wait-timeout 300
sudo docker compose up -d --force-recreate --no-deps --wait --wait-timeout 60 proxy
sudo docker compose ps
```

No se necesita modificar `.env`, borrar volúmenes, reconstruir Java ni reiniciar cloudflared para estos cambios. Conservar la red externa y los ajustes del túnel existentes. No ejecutar `down -v`.

## Funcionamiento y permisos

- `POST /api/pedidos`: compra sin cuenta, solo transferencia. Exige mismo origen y cabecera `Idempotency-Key` con UUID. Hasta 50 líneas. Valida producto/variante, visibilidad, cantidades enteras, precio vigente, cliente y dirección. Calcula flete y totales en centavos desde el servidor. Repetir una clave con el mismo contenido devuelve el pedido existente; con otros datos devuelve 409.
- En una transacción `BEGIN IMMEDIATE` guarda pedido, instantánea de productos/precios, evento inicial y correo pendiente; descuenta stock del catálogo. Un fallo revierte todo. El stock mostrado es el disponible después de reservas.
- Las reservas pendientes duran **24 horas**. Se revisan al abrir tienda/Home, crear o consultar pedidos y abrir gestión. Una reserva vencida se cancela y devuelve stock una sola vez; no existe cron independiente. Un pedido pagado deja de vencer.
- `GET /api/pedidos/{UUID}`: consulta pública sin nombre, teléfono, cédula, correo ni dirección del cliente. Solo acepta el identificador largo. Si no existe en SQLite, consulta el pedido anterior de Java por UUID. Un fallo de Java devuelve 503, no un falso 404.
- `/api/admin/pedidos` y `/{UUID}`: listado paginado de 20, filtros por estado y búsqueda por UUID/cliente/correo, detalle privado e historial. Exigen sesión SQLite activa de rol **admin**. Editor y visitante reciben 403/401. PATCH exige mismo origen, estado anterior y nota de hasta 500 caracteres; un cambio concurrente devuelve 409.
- Estados: pendiente → pagado → preparación → enviado → entregado. El retiro en planta pasa de preparación a entregado. Puede cancelarse antes de enviar, con motivo obligatorio. Cancelar devuelve stock una sola vez. Si ya se pagó, el reembolso se coordina manualmente; la web no mueve dinero.
- El guardado editorial del catálogo compara `actualizado_en` dentro de una transacción: una pestaña abierta antes de una compra no puede devolver accidentalmente el stock anterior al guardar. Debe recargarse y reaplicarse la edición.
- Se mantienen `numero_pedido` como referencia interna y UUID aleatorio como identificador público. Formularios, enlaces y mensajes utilizan `/seguimiento?pedido={UUID}`. Nginx bloquea las antiguas rutas públicas Java de pedidos para impedir búsqueda incremental y un segundo checkout.

## Banco Pichincha

En `/administracion/pedidos`, abrir **Cuenta bancaria**. Configurar titular (3–150 caracteres), tipo de cuenta, número (6–20 dígitos), cédula/RUC (10/13 dígitos). Solo admin puede guardar. La cuenta se conserva en SQLite y aparece antes y después de confirmar el checkout, y en el seguimiento de un pedido pendiente.

La cuenta inicial es un ejemplo de ceros, claramente rotulado **no transferir**. No representa una cuenta real de CONLAC-T. Eliminar esa advertencia requiere guardar datos reales válidos desde gestión.

## Correo y WhatsApp

Las notificaciones nuevas y los cambios de estado incluyen el UUID y el enlace público completo. Los mensajes prellenados de WhatsApp del checkout, seguimiento y contacto al cliente también incluyen ese enlace. La web no envía WhatsApp automáticamente.

El correo del pedido se registra en `shop_order_mail` junto con la transacción y se procesa después de responder HTTP. Si SMTP falla, el pedido permanece válido. Hay hasta cinco intentos con espera creciente, procesados en lotes de tres durante actividad posterior de creación/listado/cambio de estado. No hay trabajador periódico ni garantía de entrega inmediata sin actividad. Como cualquier SMTP, un corte después de aceptar un mensaje puede producir una entrega duplicada al reintentar.

El problema de conectividad SMTP `ETIMEDOUT` debe resolverse aparte. Comprobar sin enviar mensajes ni revelar secretos:

```bash
sudo docker compose exec -T frontend node scripts/smtp-check.cjs
```

## Imágenes y rendimiento

Al abrir la SQLite por primera vez, una migración transaccional sustituye las imágenes base64 existentes de `paginas_editables.contenido_json` y `recetas_editables.imagen_url` por rutas `/api/media/{sha256}`. Los bytes se guardan en `content_images`, deduplicados por contenido y MIME. Las nuevas cargas siguen admitiendo JPEG/PNG/WebP/GIF de hasta 5 MB; se separan al guardar.

- Los bytes dejan de viajar dentro del HTML/RSC/JSON inicial. Los componentes reciben URLs cortas y Next Image puede optimizarlas.
- Cada imagen tiene URL inmutable, caché pública de un año, ETag y respuesta 304. Se conservan imágenes anteriores para no romper enlaces, carritos o instantáneas.
- Nginx comprime HTML, JSON, CSS, JS y RSC con gzip y evita el volcado de cuerpos grandes al directorio temporal del proxy.
- La tienda continúa dinámica para mostrar stock vigente. No se fuerza caché pública de páginas con contenido editable o cuentas.
- El archivo SQLite puede seguir ocupando espacio previamente asignado después de la migración. No se ejecuta VACUUM automáticamente ni se promete que baje inmediatamente de 42 MB; el objetivo es reducir el tráfico inicial.

## Verificación

Compilación `npm run build`, TypeScript y ESLint de los archivos modificados. Pruebas aisladas:

```bash
node --test scripts/orders-and-media.test.cjs scripts/admin-validation.test.cjs scripts/sqlite-auth.test.cjs scripts/auth-origin.test.cjs scripts/user-management.test.cjs scripts/account-security.test.cjs
```

Cubren stock atómico, rollback de varias líneas, idempotencia, precios manipulados, presentaciones, cancelación, expiración, transiciones, privacidad, permisos, origen, correos simulados y migración de imágenes. No envían correos reales.

La revisión local de producción utilizó una SQLite temporal y Chrome headless: checkout, stock, cambio de estado, guardado editorial obsoleto (409), seguimiento UUID, enlace WhatsApp y pantalla administrativa a 1440/375 px. Una imagen PNG de 3 MB reutilizada en dos productos dejó un HTML de tienda de aproximadamente 45 KB, sin base64. Es una medición de prueba, no del servidor de producción.

Después de desplegar, probar con un pedido controlado: revisar stock, crear, verificar transferencia, preparar y entregar; crear otro y cancelarlo para verificar devolución. Confirmar la cuenta bancaria y el envío SMTP reales. Los pedidos de Java necesitan una migración independiente para aparecer en esta gestión; no se copian automáticamente ni se alteran sus reservas.
