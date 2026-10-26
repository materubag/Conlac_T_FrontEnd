# ==============================================================================
# CONLAC-T Frontend (Next.js 16) - imagen de producción independiente
# ==============================================================================
# IMPORTANTE: las variables NEXT_PUBLIC_* se incrustan en el bundle durante el
# BUILD, no al arrancar el contenedor. Por eso se reciben como ARG y no como
# variables de entorno en tiempo de ejecución.
# ==============================================================================

# ------------------------------------------------------------------------------
# Etapa 1: dependencias
# ------------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# Etapa 2: compilación
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Configuración pública incrustada en el bundle del navegador.
# NEXT_PUBLIC_BACKEND_URL no puede ir vacía: los servicios de src/services/
# lanzan un error al cargarse si falta, y eso rompe la compilación. Con el valor
# por defecto el sitio compila y, al no existir ese backend, cae en su catálogo
# local y se ve completo igual (modo autónomo).
ARG NEXT_PUBLIC_BACKEND_URL="http://localhost:8080/api"
ARG NEXT_PUBLIC_APP_NAME="CONLAC-T"
ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"
ARG NEXT_PUBLIC_WHATSAPP_NUMBER="593987654321"
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=""

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ------------------------------------------------------------------------------
# Etapa 3: ejecución
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001

# La salida "standalone" trae su propio server.js y solo las dependencias
# realmente usadas; los assets estáticos se copian aparte.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Carpeta de la base SQLite de contenidos. Debe montarse como volumen: sin él,
# todo lo que el administrador publique se pierde al recrear el contenedor.
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
VOLUME ["/app/data"]

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
