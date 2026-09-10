import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl } from "@/lib/utils";

/**
 * ============================================================
 * CTA FINAL DE TIENDA - CONLAC-T
 * ============================================================
 * 
 * Llamado a la acción final antes del pie de página.
 */
export const StoreCTA: React.FC = () => {
  const whatsappUrl = buildWhatsAppUrl({
    message: "Hola CONLAC-T, deseo realizar un pedido directo de quesos artesanales.",
  });

  return (
    <section
      aria-label="Llamado a la acción para visitar la tienda"
      className="py-16 sm:py-20 bg-primary text-inverted relative overflow-hidden"
    >
      {/* Patrones de fondo sutiles */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F8F4E9_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <Container className="relative z-10 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <span className="inline-block text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Apoya a las familias productoras de Tungurahua
          </span>

          <h2 className="text-2xl sm:text-4xl font-headline font-bold text-inverted leading-tight">
            Lleva el sabor auténtico del páramo andino a tu mesa
          </h2>

          <p className="text-sm sm:text-base text-inverted/80 leading-relaxed max-w-xl mx-auto">
            Disfruta de quesos frescos, amasados y madurados con entrega local
            y opciones de pedido asistido directo por WhatsApp.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              href="/tienda"
              variant="inverted"
              size="lg"
              className="w-full sm:w-auto shadow-md"
            >
              <span>Ir a la tienda virtual</span>
              <ArrowRightIcon className="w-4 h-4 text-primary" />
            </Button>

            <Button
              href={whatsappUrl}
              variant="outlined"
              size="lg"
              isExternal
              className="w-full sm:w-auto border-inverted text-inverted hover:bg-inverted hover:text-primary"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Pedir por WhatsApp</span>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};
