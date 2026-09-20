# Integración y QA — Persona 5

Fecha: 19 de septiembre de 2026.

## Alcance y estado inicial

Proyecto Next.js con App Router, React y Tailwind. El único cambio previo visible en `git status --short` era `.vscode/` sin seguimiento; no se modificó.

Se conservaron los contratos de `src/types/index.ts`, los datos y funciones de `src/lib/data.ts` (Persona 1), el contenido y diseño de asociaciones (Persona 2), los componentes generales y `/nosotros` (Persona 3), y el formulario/API de administración (Persona 4). No se añadieron dependencias al proyecto ni se modificó el lockfile.

## Archivos creados

| Archivo | Motivo |
| --- | --- |
| `src/components/associations/AssociationMapPreview.tsx` | Mapa OpenStreetMap con marcador, referencia de ubicación y enlaces a Google Maps/OpenStreetMap. Consume `Asociacion`; valida coordenadas finitas y sus rangos, acepta cero y ofrece un mensaje cuando faltan. Iframe con título y carga diferida; enlaces con aviso de nueva pestaña. |
| `src/components/ui/Breadcrumbs.tsx` | Navegación reutilizable mediante `nav`/`ol`, `aria-current="page"`, separadores decorativos ocultos a lectores y ajuste de nombres largos. |
| `src/app/asociaciones/loading.tsx` | Skeleton del listado, anuncio mediante `role="status"` y animación solo sin preferencia de movimiento reducido. |
| `src/app/asociaciones/[slug]/loading.tsx` | Skeleton específico del perfil, con los mismos criterios de accesibilidad. |
| `src/app/asociaciones/not-found.tsx` | Vista de asociación no encontrada con breadcrumbs y regreso al listado; reutiliza el `notFound()` existente. |
| `docs/qa-persona-5.md` | Registro de cambios, pruebas y pendientes para los demás integrantes. |

## Archivos modificados

| Archivo | Cambio mínimo y motivo |
| --- | --- |
| `src/app/asociaciones/page.tsx` | Importar y mostrar breadcrumbs. No se alteró su consulta de datos ni sus tarjetas. |
| `src/app/asociaciones/[slug]/page.tsx` | Sustituir únicamente el breadcrumb anterior e insertar `AssociationMapPreview` con la asociación ya consultada. Integración necesaria dentro de la página de Persona 2; se conserva el resto del perfil. |
| `src/app/tienda/page.tsx` | Importar y mostrar breadcrumbs. |
| `src/app/tienda/[slug]/page.tsx` | Sustituir el breadcrumb anterior y resolver `product.asociacion_id` mediante `getAssociationById()` para mostrar el enlace al slug de la asociación, o su ID cuando no tenga slug. No se inventan relaciones a partir del nombre ni se muestran enlaces cuando la consulta no devuelve asociación. |

## Funcionalidades y defectos de integración resueltos

- Ubicación visible a partir de los datos existentes, sin API key ni otro catálogo de coordenadas. La referencia y los enlaces siguen disponibles aunque el proveedor del mapa no cargue.
- Estados de carga diferenciados para listado y perfil, y vista de asociación inexistente con recuperación al listado.
- Breadcrumbs anteriores sin indicación semántica de página actual, con separadores anunciables y sin ajuste de línea: sustituidos por el componente accesible compartido.
- Falta de navegación desde cada detalle de producto hacia su asociación: resuelta para los cuatro productos existentes.
- Durante QA, el CSS global de enlaces también afectó al nuevo botón de la vista 404. Se corrigió el texto dentro de ese botón y de los nuevos enlaces de mapas, incluido hover, sin cambiar `Button` ni los estilos globales.

## Pruebas realizadas

Entorno: Windows, Node 22.17.0, Chromium mediante Playwright y axe-core. Herramientas de navegador ejecutadas desde caché/carpeta temporal, sin instalar dependencias en este repositorio.

Se revisaron ocho rutas a **320, 375, 425, 768, 1024, 1440 y 1920 px**: 56 combinaciones, con mediciones de geometría del DOM, comprobaciones de recorte y capturas en 320/768/1440. Se inspeccionaron visualmente capturas representativas del perfil, mapa, producto y listado. No se observaron imágenes deformadas en ellas.

| Ruta | Resultado |
| --- | --- |
| `/` | Carga correcta; desbordamiento previo de acciones de productos a 1024 px. |
| `/asociaciones` | Carga correcta en puerto 3000; breadcrumbs sin desbordamiento en los siete anchos. |
| `/asociaciones/asociacion-san-francisco-chibuleo` | Perfil con el nombre más largo, breadcrumb y mapa correctos; sin elementos fuera del viewport en los siete anchos. |
| `/tienda` | Carga correcta; desbordamiento previo de acciones de productos a 1024 px. |
| `/tienda/prod-queso-amasado` | Breadcrumb y enlace de asociación correctos; sin elementos fuera del viewport en los siete anchos. |
| `/nosotros` | Carga correcta; sin elementos fuera del viewport en los siete anchos. |
| `/asociaciones/no-existe-qa` | Vista personalizada y regreso al listado correctos; sin desbordamiento. En desarrollo se observó HTTP 200 con la vista no encontrada y `robots=noindex` en la respuesta con streaming; no se afirma haber verificado HTTP 404 en producción. |
| `/administracion/asociaciones` | Carga correcta; se revisó accesibilidad sin enviar ni modificar datos. |

Comprobaciones adicionales:

- Navegación real por clic: listado → perfil → tienda; los cuatro productos → sus asociaciones; navbar de escritorio y móvil; enlaces institucionales del footer; recuperación desde la vista 404.
- Los cuatro alias históricos de asociaciones continúan abriendo sus perfiles.
- OpenStreetMap se cargó y mostró el marcador al desplazar el mapa al área visible. Se verificaron ambos enlaces externos y el foco visible al pasar entre ellos mediante Tab.
- Menú móvil abierto mediante teclado; navegación por sus enlaces y cierre mediante Escape comprobados. El defecto de restitución de foco se detalla abajo.
- Once casos de coordenadas: siete ausentes/inválidos y cuatro válidos, incluidos `(0, 0)` y extremos de rangos. Los inválidos no generan iframe ni enlaces a coordenadas falsas.
- Breadcrumb con nombre artificialmente largo y ambos skeletons renderizados de forma aislada: sin desbordamiento en los siete anchos; skeletons sin animación con `prefers-reduced-motion: reduce`. No se introdujeron demoras artificiales en las consultas reales para probar su duración en pantalla.
- axe-core: sin infracciones en los componentes nuevos comprobados de forma aislada, en el contenido de la vista 404 y en el contraste de los enlaces de mapa durante hover. Las páginas completas conservan infracciones preexistentes indicadas abajo.
- No se detectaron imágenes sin `alt` mediante el análisis automatizado de las rutas recorridas. La revisión del formulario sí encontró campos sin etiqueta visible asociada.
- Cero errores JavaScript de página durante el recorrido de las 56 combinaciones.
- No se realizó una auditoría con lector de pantalla ni una certificación WCAG completa; los controles internos del proveedor de mapas no se auditaron exhaustivamente.

Scripts, resultados JSON y capturas de esta sesión: `%TEMP%\conlac-persona5-qa` (artefactos temporales, fuera del repositorio).

## Hallazgos previos pendientes, sin modificar

| Responsable probable | Hallazgo y evidencia | Seguimiento |
| --- | --- | --- |
| Persona 2 / integración del listado | `src/app/asociaciones/page.tsx` consulta literalmente `http://localhost:3000/api/asociaciones`. QA en puerto 3000 funciona; el código depende de que esa dirección esté disponible. | Coordinar consumo de la capa de datos o configuración del origen, preservando el flujo del formulario de Persona 4. No se cambió esa consulta. |
| Persona 2 | El botón «Ver quesos de esta asociación» abre `/tienda` sin filtrar. El perfil aún no muestra productos relacionados, galería, video ni ficha completa; no existen `AssociationProfile`, `AssociationCard` ni `ArcsaBadge` en este checkout. | Pendientes de Persona 2; no se implementaron ni reemplazaron sus componentes. |
| Persona 2 | La referencia fija del perfil dice Pilahuín incluso cuando `ubicacion_referencia` especifica otro detalle. El mapa nuevo sí consume la referencia existente de cada asociación. | Sustituir ese texto fijo al completar el perfil. |
| Persona 3 | En `/` y `/tienda`, a 1024 px el extremo derecho de las acciones de una tarjeta llega a **1041 px**; `overflow-hidden` recorta el contenido. Las acciones también quedan apretadas en tarjetas pequeñas. | Ajustar la distribución de `ProductCard` sin confundir ausencia de scroll horizontal con ausencia de recorte. |
| Persona 3 | axe-core detecta contraste **1.01:1** en varios botones primarios: la regla global no estratificada `a { color: inherit }` prevalece sobre las utilidades de color de Tailwind. También hay textos terciarios con contraste insuficiente. | Revisar la capa CSS global y los colores junto al responsable del diseño. Solo se protegieron los textos de los botones nuevos de esta integración. |
| Persona 3 | `/tienda` pasa de `h1` a `h3` en `ProductCard`; axe-core marca `heading-order`. El título usa `line-clamp-1`, que puede abreviar nombres. | Acordar jerarquía de títulos y comportamiento de nombres largos. |
| Persona 3 | Al enfocar un enlace del menú móvil y cerrar con Escape, el foco termina en `BODY`; no vuelve al botón de apertura. El diálogo declarado modal no implementa gestión de foco. El carrito es un `div role="button"` sin acción, marcado como mock en su código. | Completar accesibilidad del menú y semántica del carrito cuando corresponda. |
| Persona 3 | Los enlaces legales del footer apuntan a `#`. En el detalle de producto a 768 px y el perfil a 320 px las acciones existentes se parten en varias líneas y tienen espaciado ajustado, aunque permanecen dentro del viewport. | Completar destinos y revisar esos espacios con los mockups. |
| Persona 4 | El textarea `historia` y los inputs de galería no tienen `label` asociado ni `aria-label`; dependen del placeholder. | Añadir etiquetas visibles/asociadas sin rehacer el formulario. |
| Persona 4 | La página administrativa añade un `main` dentro del `main` del layout; axe-core detecta landmarks duplicados/anidados. | Usar un contenedor no landmark dentro del layout existente. |
| Persona 4 / Persona 1 | El formulario recoge referencia vial y número de familias, pero no los envía como `ubicacion_referencia` y `numero_familias` en el objeto de creación; otros campos del formulario tampoco se trasladan. | Acordar el mapeo con los contratos existentes. No se alteraron payloads ni tipos. |
| Persona 1 | `getAssociations()` imprime todas las asociaciones en consola durante consulta/build. | Retirar los logs de depuración cuando termine su trabajo. |

## QA técnico y control final

- `npm run lint`: **correcto**, código de salida 0, sin errores ni advertencias de ESLint.
- `npm run build`: **correcto**, código de salida 0; compilación, TypeScript y generación de 23 páginas completadas. Aviso de Next sobre un `package-lock.json` en `C:\Users\tcris` fuera del repositorio; se dejó intacto.
- `git diff --check`: **correcto**. Git avisa de la normalización LF/CRLF configurada en este entorno; no hay errores de whitespace.
- Se revisaron los diffs después de implementar los componentes, integrar las páginas y realizar QA. Cuatro archivos existentes modificados y seis archivos nuevos, incluido este reporte. Sin borrados, refactors globales ni cambios en el trabajo previo de `.vscode/`.
