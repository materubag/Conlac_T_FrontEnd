# Debian con Docker: entrada pública en 3079

Configuración para el estado actual del proyecto, revisada el 16/11/2026. Mantiene las cuentas y la edición en Next + SQLite, correo de cuentas con Nodemailer, y pedidos/consultas con Java + PostgreSQL. No migra automáticamente el frontend a los nuevos controllers privados de Java.

## Qué se aloja

| Servicio | Puerto interno | Datos |
| --- | --- | --- |
| Next.js | 3000 | Volumen `sqlite-data`, montado en `/app/data` |
| Spring Boot / Java 25 | 8080 | PostgreSQL; SMTP operativo y Storage/JWT del proyecto Supabase |
| PostgreSQL 16 | 5432 | Volumen `postgres-data` |
| Nginx de entrada | 80 | Se publica como **3079** en Debian |

El túnel existente sigue enviando tráfico al puerto **3079** del servidor. No configurar 3000/8080 como destinos nuevos ni exponer PostgreSQL. Si cloudflared corre en un contenedor con su propia red, su `localhost` no es Debian: conservar el mecanismo actual de acceso al host usando la dirección del servidor y 3079.

Rutas públicas:

- `https://TU_DOMINIO/` → Next.
- `https://TU_DOMINIO/api/auth/...` y `/api/admin/...` → handlers actuales de Next, con SQLite.
- `https://TU_DOMINIO/backend/api/orders` y otras lecturas públicas → Java.
- Autenticación/admin Java, webhooks y Actuator no se publican mediante este proxy. El webhook de tarjetas descartado queda inaccesible desde esta entrada.

Solo se publica el puerto 3079; los otros tres servicios se comunican por la red privada de Compose. `BIND_IP=0.0.0.0` permite el acceso del túnel mediante la IP de Debian. Si tu cloudflared usa red de host y llega por loopback, puedes limitarlo a `127.0.0.1`. Si 3079 queda accesible fuera del túnel, restringir ese acceso con la política de red apropiada para tu servidor.

## 1. Publicar primero los cambios desde tu equipo de desarrollo

El 16/11, la referencia local de `origin/develop` del frontend era `ad87178`, con cinco commits locales por delante. Deben estar publicados para que el clon de Debian los reciba. Estos archivos de despliegue también deben subirse; no subir `.env`, datos ni respaldos.

Desde `Conlac_T_FrontEnd`, en tu equipo:

```powershell
git status
git add .dockerignore deploy/debian
git commit -m "Prepara despliegue Docker en Debian"
git push origin develop
```

No es necesario instalar Node, Java o Maven en Debian: los Dockerfiles construyen y ejecutan las aplicaciones. Sí necesitas Compose disponible mediante `docker compose`.

## 2. Clonar en Debian — primera instalación

```bash
docker compose version
sudo install -d -o "$(id -u)" -g "$(id -g)" /opt/docker/conlact
cd /opt/docker/conlact

git clone --branch develop --single-branch https://github.com/materubag/Conlac_T_FrontEnd.git
git clone --branch develop --single-branch https://github.com/ManuelNKI/conlact-backend.git

cd Conlac_T_FrontEnd/deploy/debian
cp .env.example .env
chmod 600 .env
nano .env
```

Si ya existen esos clones o `.env`, reutilizarlos; no ejecutar de nuevo el paso de creación del archivo de secretos. Git puede pedir autenticación si el repositorio es privado. No poner tokens dentro de la URL del clon.

## 3. Completar `.env`

Obligatorio reemplazar los ejemplos:

- `APP_ORIGIN`: tu URL pública HTTPS existente, **sin barra final y sin :3079** cuando Cloudflare sirve el dominio por HTTPS normal. Ejemplo de forma: `https://conlact.midominio.com`.
- `FRONT_PORT=3079` y número real de WhatsApp.
- `POSTGRES_PASSWORD`: contraseña nueva y larga. Puedes generarla con `openssl rand -hex 32` y pegarla entre comillas simples.
- Proyecto, anon key y **service role key nueva** de Supabase. Java aún inicializa sus componentes JWT/Storage con esa configuración; no es el mecanismo de login de SQLite. Con clave pública JWT vacía, intenta resolver JWKS del proyecto al iniciar. Si no es resoluble, pedir al equipo la clave pública válida; no usar un secreto JWT de demostración para esconder el error.
- SMTP válido: `SMTP_HOST`, puerto, usuario, contraseña de aplicación nueva y remitentes. Next usa `SMTP_FROM`; Java usa `MAIL_FROM`, `MAIL_FROM_NAME`, `MAIL_ADMIN_RECIPIENT` y `MAIL_ENABLED`.
- Admin inicial: email real al que tengas acceso y clave larga con letra/número. Solo aplica si la tabla local de cuentas todavía está vacía. Importar una SQLite anterior conserva las cuentas y claves anteriores; estas variables no las sobrescriben.

Para SMTP 587 se usan STARTTLS/auth; para 465 adaptar `SMTP_PORT`, `SMTP_SSL_ENABLED=true`, `SMTP_STARTTLS_ENABLED=false`. No usar las credenciales que se compartieron en chats o quedaron en respaldos del código: rotarlas primero. No copiar claves secretas a variables `NEXT_PUBLIC_*`.

Comprobar que no quedaron marcadores sin editar:

```bash
grep -nE 'CAMBIAR|TU_PROYECTO|tu-dominio\.example|example\.com' .env
```

Ese comando solo se debe usar antes de sustituir los marcadores; evita compartir su salida si agregaste información privada en esas líneas. Las comillas simples en `.env` ayudan a conservar `$` y otros caracteres de las contraseñas.

## 4. Construir y arrancar

```bash
docker compose config --quiet
docker compose build
docker compose up -d --wait --wait-timeout 300
docker compose ps
```

El primer build descarga dependencias Node y Maven e imágenes; puede tardar varios minutos y necesita memoria/disco suficientes. No es una garantía de despliegue en cinco minutos.

El PostgreSQL de esta configuración es **una base nueva local en Debian**, no la BD remota de Supabase. En su primer arranque ejecuta `docker/init/00..06` y la migración de outbox/perfiles como script 07. No vuelvas a ejecutar el modelo base sobre un volumen que ya tiene datos. Los scripts de inicialización no se vuelven a aplicar al reiniciar un volumen existente; futuros cambios requieren migraciones revisadas.

La compatibilidad SQL `auth`/`storage` de esos scripts no instala Supabase Auth ni Storage HTTP. Las fotos públicas guardadas como URLs de Supabase necesitan que el proyecto/buckets remotos sigan disponibles. El inventario de esta base nueva tampoco importa automáticamente el inventario de la BD remota.

## 5. Verificar sin crear datos

Desde esta misma carpeta:

```bash
curl -fsS http://127.0.0.1:3079/healthz
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3079/
curl -fsS http://127.0.0.1:3079/backend/api/products
docker compose exec -T backend curl -fsS http://127.0.0.1:8080/actuator/health
docker compose logs --tail=100 postgres backend frontend proxy
```

Prueba también el dominio público con HTTPS; cookies de gestión en producción son Secure y no funcionan de la misma manera entrando por HTTP a la IP. Probar login, OTP, correo nuevo, una compra controlada y su seguimiento. Un healthcheck sano no demuestra envío SMTP, consistencia de stock o integración de todas las pantallas.

Si aparece 502, verificar primero `docker compose ps` y logs de backend/frontend. No publiques Actuator completo para resolverlo; usa el comando interno anterior. No compartas logs que incluyan secretos o datos de compradores.

## 6. Llevar la SQLite que editaste en Windows (opcional, antes de usar producción)

Los datos locales no están en Git ni en la imagen. Si no se importan, las páginas usarán sus defaults y las cuentas iniciales de un almacén nuevo. Para conservar tus textos y cuentas, generar un snapshot consistente con SQLite, no copiar solo un `.db` abierto ignorando su WAL.

En Windows, con Node actual compatible con la API `backup`, desde `Conlac_T_FrontEnd`:

```powershell
node -e "const {DatabaseSync,backup}=require('node:sqlite'); const db=new DatabaseSync('data/contenidos.db',{readOnly:true}); backup(db,'.next/contenidos-export.db').then(()=>db.close()).catch(e=>{db.close();console.error(e.message);process.exitCode=1});"
```

Crear destino en Debian:

```bash
cd /opt/docker/conlact/Conlac_T_FrontEnd/deploy/debian
mkdir -p import
chmod 700 import
```

Subir desde Windows, reemplazando usuario y host:

```powershell
scp .next/contenidos-export.db USUARIO@IP_DEBIAN:/opt/docker/conlact/Conlac_T_FrontEnd/deploy/debian/import/contenidos.db
```

Después de `docker compose build` y **antes del primer `up`**, importar únicamente si el volumen no tiene ya una base:

```bash
docker compose run --rm --no-deps --user 0 \
  -v "$PWD/import:/import:ro" frontend sh -ec '
    test -s /import/contenidos.db
    if test -e /app/data/contenidos.db; then
      echo "La base destino ya existe. No se sobrescribio. Haz un respaldo y planifica la restauracion."
      exit 1
    fi
    cp /import/contenidos.db /app/data/contenidos.db
    chown 1001:1001 /app/data/contenidos.db
    chmod 600 /app/data/contenidos.db
  '
docker compose up -d --wait --wait-timeout 300
```

Si ya arrancaste y se creó una SQLite, este comando se niega a sustituirla. No reemplazar una BD de producción sin detener sus escritores, respaldar y planificar el corte. No copiar al servidor archivos `-wal/-shm` de forma aislada. Las rutas de imágenes locales necesitan también sus archivos de `public`; las URL remotas siguen dependiendo de su alojamiento. No entregar una cuenta de demostración como credencial de producción.

## 7. Respaldos

Desde Debian, respaldos privados antes de actualizar o migrar:

```bash
umask 077
mkdir -p backups
stamp=$(date +%Y%m%d-%H%M%S)

docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > "backups/postgres-$stamp.dump"

docker compose exec -T -e SNAPSHOT="/tmp/contenidos-$stamp.db" frontend \
  node -e 'const {DatabaseSync,backup}=require("node:sqlite"); const db=new DatabaseSync("/app/data/contenidos.db",{readOnly:true}); backup(db,process.env.SNAPSHOT).then(()=>db.close()).catch(e=>{db.close();console.error(e.message);process.exitCode=1});'
docker compose cp "frontend:/tmp/contenidos-$stamp.db" "backups/contenidos-$stamp.db"
```

Comprobar que ambos comandos terminan correctamente y guardar otra copia fuera del servidor; ensayar restauración en una base de prueba. Estos comandos no establecen por sí mismos una política diaria: programarla tras validar el proceso. Los backups contienen cuentas y datos privados; no subirlos a Git.

## 8. Actualizaciones

Hacer backup antes. Luego:

```bash
cd /opt/docker/conlact/Conlac_T_FrontEnd
git pull --ff-only origin develop
cd ../conlact-backend
git pull --ff-only origin develop
cd ../Conlac_T_FrontEnd/deploy/debian

# Revisar y aplicar las migraciones NUEVAS acordadas con backend.
docker compose config --quiet
docker compose build
docker compose up -d --wait --wait-timeout 300
docker compose ps
```

Si cambias el dominio o la URL pública de API, reconstruir frontend: `NEXT_PUBLIC_*` se incrusta en el build. Para cambios de SMTP en `.env`, `docker compose up -d` recrea los servicios afectados; `restart` solo no inyecta variables nuevas.

No ejecutar `docker compose down -v`, `docker volume prune` ni borrar volúmenes para arreglar un despliegue: perderías datos. `docker compose down` sin `-v` conserva volúmenes, aunque interrumpe el servicio; las actualizaciones normales usan `up -d`.

## Límites actuales que alojar contenedores no corrige

Esta configuración pone las dependencias necesarias a disposición del código actual. No convierte automáticamente el proyecto en un MVP terminado:

- El catálogo editable SQLite y los productos/variantes PostgreSQL deben homologarse. No aceptar ventas reales si el carrito usa IDs locales o la variante de respaldo y los precios/stock no coinciden.
- Las cuentas de Next permanecen en SQLite; las de Java/Supabase son otra autoridad. El proxy no expone los nuevos endpoints privados Java precisamente para no mezclarlas accidentalmente.
- El webhook descartado de pagos está bloqueado en esta entrada. No publicar 8080 directamente ni crear otro túnel que lo exponga sin corregir ese handler.
- Capacitación/CMS, editor, transferencias, expiraciones y panel operativo aún requieren la integración y pruebas descritas en las guías de entrega. Los archivos Docker antiguos llamaban «autónomo» a un sitio que sí dependía de Java para pedidos.
- El Compose no es una migración de un PostgreSQL existente, no instala Supabase completo y no provisiona buckets remotos.
- En el proxy se reemplaza X-Forwarded-For por su peer; con cloudflared puede agrupar varios usuarios bajo una IP para rate limiting. Antes de tráfico real configurar la IP original de Cloudflare solo desde proxies/redes confiables; no confiar en un encabezado arbitrario de Internet.

El Compose se valida con `docker compose --env-file .env.example config --quiet`. La ejecución real, build, SMTP, DNS y migraciones deben comprobarse en Debian con los valores del entorno; no se ejecutaron contenedores contra tu servidor desde esta entrega.
