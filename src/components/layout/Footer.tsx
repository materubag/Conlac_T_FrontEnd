import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config";
import { FOOTER_NAV_SECTIONS } from "@/config/navigation";
import { Container } from "@/components/ui/Container";
import { MapPinIcon, ShieldCheckIcon } from "@/components/ui/Icons";

/**
 * ============================================================
 * FOOTER INSTITUCIONAL - CONLAC-T
 * ============================================================
 * 
 * Estructura de pie de página accesible con navegación secundaria,
 * métodos de compra simulados, información de procedencia y créditos.
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-[#184332] text-[#F8F4E9] mt-auto border-t-4 border-tertiary"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Pie de página institucional de CONLAC-T
      </h2>

      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#2D6A4F]/60">
          
          {/* Columna 1 y 2: Identidad y Territorio */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-tertiary rounded-lg p-1"
            >
              <div className="relative w-12 h-12 flex-shrink-0 bg-surface rounded-full p-1 shadow-sm">
                <Image
                  src={siteConfig.assets.logo}
                  alt="Logo oficial de CONLAC-T"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-2xl font-bold tracking-tight text-[#F8F4E9]">
                  CONLAC-T
                </span>
                <span className="text-xs uppercase font-label tracking-widest text-[#D4A373]">
                  Consorcio de Lácteos de Tungurahua
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#F8F4E9]/80 max-w-md leading-relaxed">
              Unión de asociaciones y familias productoras de Pilahuín comprometidas
              con la preservación de la tradición quesera andina, calidad sanitaria y
              desarrollo agroecológico comunitario.
            </p>

            <div className="pt-2 flex items-start gap-2.5 text-xs text-[#F8F4E9]/75">
              <MapPinIcon className="w-4 h-4 text-[#D4A373] flex-shrink-0 mt-0.5" />
              <span>{siteConfig.location.address}</span>
            </div>
          </div>

          {/* Columna 3: Explorar */}
          <div>
            <h3 className="font-label text-sm font-semibold uppercase tracking-wider text-[#D4A373] mb-4">
              Explorar
            </h3>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_NAV_SECTIONS.explorar.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[#F8F4E9]/80 hover:text-[#D4A373] transition-colors focus-visible:ring-2 focus-visible:ring-tertiary rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Institucional */}
          <div>
            <h3 className="font-label text-sm font-semibold uppercase tracking-wider text-[#D4A373] mb-4">
              Institucional
            </h3>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_NAV_SECTIONS.institucional.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[#F8F4E9]/80 hover:text-[#D4A373] transition-colors focus-visible:ring-2 focus-visible:ring-tertiary rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 5: Métodos y Garantía */}
          <div>
            <h3 className="font-label text-sm font-semibold uppercase tracking-wider text-[#D4A373] mb-4">
              Métodos de Compra
            </h3>
            <div className="space-y-3 text-xs text-[#F8F4E9]/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
                <span>Transferencia Bancaria Directa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
                <span>Pedidos Asistidos por WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
                <span>Retiro en Planta Comunitaria</span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2D6A4F]/60 flex items-center gap-2 text-[#D4A373]">
                <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-xs">Garantía Sanitaria BPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior: Derechos de autor y Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F8F4E9]/60">
          <p>
            © {currentYear} {siteConfig.fullName} (CONLAC-T). Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            {FOOTER_NAV_SECTIONS.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-[#D4A373] transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
};
