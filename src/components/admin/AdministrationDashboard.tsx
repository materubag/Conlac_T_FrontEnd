"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArrowRightIcon, ChefHatIcon, MapPinIcon, MountainIcon, UserIcon, UsersIcon } from "@/components/ui/Icons";

type IconName = "home" | "store" | "associations" | "recipes" | "tourism" | "about" | "guide" | "contact" | "orders" | "account" | "footer";
interface DashboardEntry { title: string; description: string; href: string; icon: IconName; category?: string; action?: string; adminOnly?: boolean }

const pages: DashboardEntry[] = [
  { title: "Inicio", description: "Textos de portada, productos destacados, garantías, testimonios y visibilidad de secciones.", href: "/", icon: "home" },
  { title: "Tienda", description: "Productos, imágenes, precios, existencias y visibilidad del catálogo de quesos.", href: "/tienda", icon: "store" },
  { title: "Asociaciones", description: "Presentación de las asociaciones y acceso a sus fichas, historias y ubicación.", href: "/asociaciones", icon: "associations" },
  { title: "Recetas", description: "Ingredientes, preparación, fotografías y videos de cada receta andina.", href: "/recetas", icon: "recipes" },
  { title: "Turismo", description: "Atractivos turísticos, experiencias, fotografías y videos de cada lugar.", href: "/turismo", icon: "tourism" },
  { title: "Nosotros", description: "Historia del consorcio, misión, visión, valores y testimonios de la comunidad.", href: "/nosotros", icon: "about" },
  { title: "Cómo comprar", description: "Pasos de compra, transferencia bancaria, entregas y preguntas frecuentes.", href: "/como-comprar", icon: "guide" },
  { title: "Contacto", description: "Información de contacto, dirección, horarios y ubicación de la organización.", href: "/contacto", icon: "contact" },
];
const tools: DashboardEntry[] = [
  { title: "Gestión de pedidos", description: "Verifica transferencias, prepara entregas y consulta el historial de cada pedido.", href: "/administracion/pedidos", icon: "orders", category: "Ventas", action: "Gestionar pedidos", adminOnly: true },
  { title: "Gestión de usuarios", description: "Crea cuentas admin y editor, asigna sus permisos y administra su acceso al portal.", href: "/administracion/usuarios", icon: "associations", category: "Equipo", action: "Gestionar usuarios", adminOnly: true },
  { title: "Buscar pedidos", description: "Consulta un pedido con su identificador completo y revisa su estado y valores.", href: "/seguimiento", icon: "orders", category: "Pedidos", action: "Buscar un pedido" },
  { title: "Mi cuenta", description: "Revisa tus datos, verifica un nuevo correo o cambia tu contraseña mediante un código.", href: "/mi-cuenta", icon: "account", category: "Cuenta", action: "Configurar mi cuenta" },
];
const footer: DashboardEntry = { title: "Pie de página", description: "Edita la información institucional y los datos de contacto que aparecen en todo el sitio.", href: "#footer-heading", icon: "footer" };

function DashboardIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  switch (name) {
    case "associations": return <UsersIcon className={className} />;
    case "recipes": return <ChefHatIcon className={className} />;
    case "tourism": return <MountainIcon className={className} />;
    case "contact": return <MapPinIcon className={className} />;
    case "account": return <UserIcon className={className} />;
  }
  const paths: Partial<Record<IconName, ReactNode>> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-8h6v8" /></>,
    store: <><path d="M3 10V7l2-4h14l2 4v3M4 10v11h16V10M8 21v-7h5v7" /><path d="M3 7h18M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>,
    about: <><path d="m3 8 9-5 9 5M3 21h18M5 18V10m7 8v-8m7 8v-8" /><path d="M2 8h20" /></>,
    guide: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M9 10h6m-6 4h6m-6 4h4" /></>,
    orders: <><path d="m3 7 9-4 9 4v10l-9 4-9-4ZM3 7l9 4 9-4M12 11v10M7 5l10 4" /></>,
    footer: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 15h18M7 18h3m4 0h3" /></>,
  };
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-4";

export function AdministrationDashboard({ name, email, canManageUsers }: { name: string; email: string; canManageUsers: boolean }) {
  const visibleTools = tools.filter(entry => !entry.adminOnly || canManageUsers);
  return <div className="bg-background py-8 sm:py-10">
    <Container>
      <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Panel de administración" }]} />
      <div className="space-y-9 sm:space-y-10">
        <header className="flex flex-col justify-between gap-6 border-b border-border pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#95612e]">Administración de CONLAC‑T</p>
            <h1 className="mt-2 font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-[40px]">Panel de administración</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-muted sm:text-base">Herramientas para cuidar el contenido del portal y gestionar la tienda y la comunidad.</p>
          </div>
        </header>

        <section aria-labelledby="admin-tools-title" className="space-y-5">
          <div className="border-b border-border pb-4"><h2 id="admin-tools-title" className="font-headline text-2xl font-bold text-primary">Gestión y cuenta</h2><p className="mt-1 text-sm text-neutral-muted">Accede a las herramientas de la organización y a la seguridad de tu cuenta.</p></div>
          <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${canManageUsers ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
            {visibleTools.map(entry => <article key={entry.href} className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#95612e]">{entry.category}</p><span className="text-primary/70"><DashboardIcon name={entry.icon} /></span></div>
              <h3 className="font-headline text-xl font-bold text-primary">{entry.title}</h3><p className="mt-2 text-xs leading-relaxed text-neutral-muted">{entry.description}</p>
              {entry.icon === "account" && <div className="mt-4 space-y-1 border-t border-border/60 pt-3 text-xs"><p className="break-words font-semibold text-primary">{name}</p><p className="break-all text-neutral-muted">{email}</p></div>}
              <div className="mt-auto pt-6"><Link href={entry.href} className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors ${entry.icon === "associations" ? "border-primary bg-primary !text-inverted hover:bg-primary-hover" : "border-border bg-background !text-primary hover:border-primary/40"} ${focus}`}><span>{entry.action}</span><ArrowRightIcon className="h-4 w-4 shrink-0" /></Link></div>
            </article>)}
          </div>
        </section>

        <section aria-labelledby="admin-pages-title" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div><h2 id="admin-pages-title" className="font-headline text-2xl font-bold text-primary">Edición de páginas web</h2><p className="mt-1 text-sm leading-relaxed text-neutral-muted">Abre una página para editar sus textos, imágenes y tarjetas directamente.</p></div>
            <span className="rounded-full border border-tertiary/35 bg-tertiary/10 px-3 py-1 text-xs font-semibold text-[#805128]">{`${pages.length} páginas editables`}</span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {pages.map(entry => <Link key={entry.href} href={entry.href} className={`group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-xs transition-colors hover:border-primary/40 ${focus}`}>
              <div className="mb-4 flex items-center justify-between gap-3"><span className="text-[11px] font-semibold tracking-wide text-neutral-muted">{entry.href}</span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-tertiary/25 bg-tertiary/10 text-[#95612e]"><DashboardIcon name={entry.icon} /></span></div>
              <h3 className="font-headline text-xl font-bold text-primary">{entry.title}</h3><p className="mt-2 flex-1 text-xs leading-relaxed text-neutral-muted">{entry.description}</p>
              <span className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs font-bold text-primary"><span>Editar página<span className="sr-only">: {entry.title}</span></span><ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>)}
          </div>
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-dashed border-primary/25 bg-primary/[0.025] p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3"><span className="mt-0.5 text-primary"><DashboardIcon name="footer" /></span><div><h3 className="text-sm font-semibold text-primary">Pie de página global</h3><p className="mt-1 text-xs leading-relaxed text-neutral-muted">{footer.description}</p></div></div>
            <a href={footer.href} className={`inline-flex shrink-0 items-center gap-2 self-start rounded-lg py-1 text-xs font-bold text-primary sm:self-center ${focus}`}>Ir al editor del footer<ArrowRightIcon className="h-4 w-4" /></a>
          </div>
        </section>

      </div>
    </Container>
  </div>;
}
