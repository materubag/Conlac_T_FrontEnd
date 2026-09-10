# Tienda Web para CONLAC-T
**Consorcio de Lácteos de Tungurahua**  
*Ubicación: Parroquia Pilahuín, Cantón Ambato, Provincia de Tungurahua, Ecuador.*

---

## 1. Descripción del Proyecto

Este repositorio contiene la **base arquitectónica y Frontend (Semanas 1 y 2 / Sprints 1 y 2)** para la plataforma web de comercio electrónico y vinculación comunitaria de **CONLAC-T**. El objetivo es conectar a las asociaciones agropecuarias de pequeños productores de las zonas altas de Tungurahua con consumidores urbanos y regionales, preservando la tradición quesera andina con estrictas normas sanitarias y comercio justo.

---

## 2. Stack Tecnológico

- **Framework:** Next.js 16+ (App Router con Server Components por defecto).
- **Librería de Interfaz:** React 19+.
- **Lenguaje:** TypeScript 5+ (Tipado estricto de extremo a extremo).
- **Estilos:** Tailwind CSS v4 con arquitectura de tokens vía CSS Variables.
- **Tipografía Web:** `next/font/google` (Playfair Display para titulares y Montserrat para cuerpo/etiquetas).
- **Calidad de Código:** ESLint 9+ con reglas de Next.js y TypeScript.
- **Iconografía:** SVGs inline accesibles y optimizados (cero dependencias externas pesadas).

---

## 3. Cómo Instalar

Asegúrate de contar con Node.js (v18.18+ o superior) y npm:

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Vinculacion

# 2. Instalar dependencias
npm install
```

---

## 4. Cómo Ejecutar

```bash
# Iniciar servidor de desarrollo en http://localhost:3000
npm run dev

# Validar calidad y reglas de linting
npm run lint

# Generar compilación de producción y chequeo de tipos
npm run build

# Iniciar servidor en modo producción
npm run start
```

---

## 5. Variables de Entorno

El proyecto incluye una plantilla `.env.example` con valores por defecto seguros:

```bash
# Copiar plantilla para entorno local
cp .env.example .env.local
```

### Variables disponibles:

| Variable | Descripción | Valor por defecto / Ejemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_NAME` | Nombre comercial de la plataforma | `CONLAC-T` |
| `NEXT_PUBLIC_APP_URL` | URL base de la aplicación web | `http://localhost:3000` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Teléfono internacional de atención | `593999999999` |
| `NEXT_PUBLIC_BACKEND_URL` | Endpoint futuro de la API backend | `http://localhost:8000/api` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Llave pública de mapas (Semana 5+) | `""` |

> [!IMPORTANT]
> Nunca incluyas credenciales privadas ni contraseñas con el prefijo `NEXT_PUBLIC_`. Todas las variables se centralizan a través de `src/lib/config.ts`.

---

## 6. Estructura de Carpetas

```
.
├── .env.example                # Plantilla de variables de entorno
├── .gitignore                  # Exclusiones de Git (.env.local, .next, etc.)
├── README.md                   # Documentación técnica completa
├── package.json                # Dependencias y scripts del proyecto
├── tsconfig.json               # Configuración de compilación TypeScript
│
├── public/
│   ├── logo/                   # Logo oficial sin fondo (CONLAC-T)
│   ├── images/                 # Ilustraciones y fondos (Hero Andino)
│   └── placeholders/           # Assets visuales para productos, recetas y rutas
│
└── src/
    ├── app/                    # Rutas y páginas de Next.js App Router
    │   ├── globals.css         # Tokens de diseño y variables CSS runtime
    │   ├── layout.tsx          # Layout raíz con fuentes, Navbar, Footer y WhatsApp
    │   ├── page.tsx            # Página de Inicio (Portada)
    │   ├── tienda/             # Catálogo (/tienda y /tienda/[slug])
    │   ├── asociaciones/       # Comunidades (/asociaciones y /asociaciones/[slug])
    │   ├── recetas/            # Gastronomía (/recetas y /recetas/[slug])
    │   ├── turismo/            # Rutas y agroturismo
    │   ├── nosotros/           # Misión, visión e identidad
    │   ├── como-comprar/       # Guía paso a paso de compra
    │   └── contacto/           # Canales de atención y ubicación
    │
    ├── components/
    │   ├── ui/                 # Componentes atómicos (Button, Badge, Container, Icons)
    │   ├── layout/             # Componentes estructurales (Navbar, Footer, WhatsAppFloatingButton)
    │   └── home/               # Secciones de portada (Hero, TrustSection, FeaturedProducts, etc.)
    │
    ├── config/
    │   ├── theme.ts            # Definición de tokens y helper applyTheme()
    │   └── navigation.ts       # Centralización de las 7 pestañas y enlaces de pie
    │
    ├── lib/
    │   ├── config.ts           # Configuración de entorno y negocio
    │   ├── data.ts             # Capa de datos desacoplada (Mocks asíncronos)
    │   └── utils.ts            # Utilidades (cn, formatPrice, buildWhatsAppUrl)
    │
    └── types/
        └── index.ts            # Contratos TypeScript de dominio y UI aislada
```

---

## 7. Sistema de Diseño / Design Tokens

La identidad visual está inspirada en la geografía andina de Pilahuín y las praderas de Tungurahua:

| Token Semántico | Valor Hex / Fallback | Propósito Visual |
| :--- | :--- | :--- |
| **Color 1 (`primary`)** | `#184332` | Verde Bosque Andino: Marca, títulos, botones principales, navegación activa. |
| **Color 2 (`background`)** | `#F8F4E9` | Crema Artesanal: Fondo general, superficies cálidas y legibilidad. |
| **Tertiary (`tertiary`)** | `#D4A373` | Ocre / Dorado Tostado: Acentos, badges de distinción, detalles y hover. |
| **Neutral (`neutral`)** | `#4A3728` | Café Tierra Profundo: Texto de lectura principal, iconos y bordes rústicos. |
| **Inverted (`inverted`)** | `#FFFFFF` | Blanco puro para alto contraste sobre superficies oscuras. |

### Variables CSS en Tiempo de Ejecución (Runtime Theme)
Definidas en `:root` dentro de `src/app/globals.css`. Mediante `applyTheme()` en `src/config/theme.ts`, cualquier panel administrativo futuro puede actualizar dinámicamente los colores sin modificar el código fuente.

### Tipografías (`next/font/google`)
- **Headline (`--font-headline`):** *Playfair Display* (Elegancia artesanal para titulares H1-H3).
- **Body & Label (`--font-body`, `--font-label`):** *Montserrat* (Alta legibilidad para párrafos, botones y metadatos).

---

## 8. Contrato TypeScript (`src/types/index.ts`)

El contrato replica exactamente las entidades requeridas para interoperabilidad con Supabase / PostgreSQL:

- `Producto`: `id`, `nombre`, `tipo_queso`, `peso`, `precio`, `fotos`, `asociacion`, `stock`, `disponible`.
- `Asociacion`: `id`, `nombre`, `historia`, `fotos`, `video_url`, `sello_sanitario`, `lat`, `lng`.
- `Receta`: `id`, `titulo`, `pasos`, `producto_slug`, `tipo_queso`, `tiempo_prep`.
- `AtractivoTuristico`: `id`, `nombre`, `descripcion`, `asociacion_cercana`, `tipo`.
- `ItemPedido`: `producto_id`, `nombre`, `cantidad`, `precio`.
- `Pedido`: `id`, `cliente`, `items`, `subtotal`, `flete`, `total`, `metodo_pago`, `estado`.

> Las propiedades exclusivas de UI (como `EditorialTag`, `ProductCardProps`, `NavigationItem`) se encuentran **aisladas** en interfaces independientes para no contaminar el contrato de backend.

---

## 9. Uso de Mocks (`src/lib/data.ts`)

Los datos iniciales representan los productos base:
1. **Queso Fresco** - Asociación San Pedro (500 g, $3.25, Stock 20).
2. **Queso Amasado** - Asociación Chibuleo (500 g, $3.90, Stock 15).
3. **Quesillo** - Asociación Pilahuín (500 g, $2.80, Stock 30).
4. **Queso Maduro Andino** - Asociación Nueva Vida (400 g, $6.50, Stock 8).

---

## 10. Cómo Reemplazar Mocks por la API Real

Los componentes **nunca** realizan llamadas `fetch()` directas. Toda la UI consume funciones asíncronas de la capa de datos:

```ts
// src/lib/data.ts
export async function getProducts(): Promise<Producto[]> {
  // En Semana 1 y 2: Retorna mock simulado
  // return Promise.resolve([...productosMock]);

  // En Semana 7+ (Integración API real / Supabase):
  const response = await fetch(`${siteConfig.backendUrl}/productos`, {
    next: { revalidate: 60 },
  });
  return response.json();
}
```

Al actualizar `src/lib/data.ts`, los componentes `ProductCard`, `FeaturedProducts`, `TiendaPage`, etc., continuarán funcionando sin ninguna modificación.

---

## 11. Convenciones de Componentes

- **Server Components por Defecto:** Máximo rendimiento y renderizado estático en el servidor (`page.tsx`, `Hero`, `FeaturedProducts`, `Footer`).
- **Client Components Aislados (`"use client"`):** Exclusivamente donde existe interactividad del navegador (como el menú móvil y scroll listener en `Navbar.tsx`).
- **Botones y Enlaces Polimórficos:** El componente `Button` se comporta como `<a>` accesible de Next.js si se provee `href` o como `<button>` nativo si es una acción.
- **Sin Valores Arbitrarios Hardcodeados:** Prohibido el uso de `bg-[#184332]` disperso. Todo estilo utiliza las clases semánticas `bg-primary`, `text-neutral`, `border-tertiary`, etc.

---

## 12. Accesibilidad (WCAG 2.2 AA)

- **Semántica HTML5:** Uso riguroso de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<address>`.
- **Navegación por Teclado:** Foco visual perceptible (`focus-visible:ring-2 focus-visible:ring-tertiary`) en todos los elementos interactivos.
- **Enlace de Salto:** Skip-link para lectores de pantalla (`Saltar al contenido principal`).
- **Contraste de Color:** Ratios de contraste calculados superiores a 4.5:1 para texto normal y 3:1 para texto grande.
- **Imágenes:** Todas las imágenes cuentan con atributos `alt` descriptivos y contextuales.

---

## 13. Estado Actual del Proyecto (Semanas 1 y 2 Completadas)

- [x] Configuración base de Next.js, React, TypeScript y Tailwind CSS v4.
- [x] Tokens de diseño centralizados y Runtime CSS Variables.
- [x] Contratos TypeScript unificados y capa de datos mockeada (`src/lib/data.ts`).
- [x] Layout global responsive con Navbar (7 pestañas oficiales + carrito visual) y Footer institucional.
- [x] Botón flotante persistente de WhatsApp con generador de enlaces dinámico.
- [x] Portada completa (Hero, Pilares de Confianza, Productos Destacados, Accesos Modulares y CTA).
- [x] Estructura de rutas preparada para todo el mapa de navegación.
- [x] Validación sin errores de `npm run lint` y `npm run build`.

---

## 14. Funcionalidades Fuera del Alcance (Semanas Posteriores)

Las siguientes funcionalidades **no forman parte de esta entrega** y se incorporarán en sus sprints respectivos:
- **Semana 3:** Páginas completas de detalle histórico para Asociaciones y Nosotros.
- **Semana 4:** Filtros avanzados de catálogo, búsqueda y categorías en Tienda.
- **Semana 5:** Recetario interactivo, mapas interactivos de agroturismo (Google Maps API).
- **Semana 6:** Estado global de carrito de compras, Checkout y pasarela PayPhone.
- **Semana 7:** Conexión a base de datos PostgreSQL / Supabase y Panel Administrativo CMS.
- **Semana 8:** Optimización final de rendimiento, analítica y despliegue a producción.
