import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cómo Comprar | CONLAC-T",
  description: "Guía paso a paso para realizar tus pedidos de quesos artesanales con entrega local y retiro.",
};

const steps = [
  {
    number: "01",
    title: "Elige tus quesos favoritos",
    description: "Revisa nuestro catálogo online con opciones de queso fresco, amasado, quesillo y maduro andino.",
  },
  {
    number: "02",
    title: "Escríbenos por WhatsApp o solicita en tienda",
    description: "Envíanos tu lista de productos y la cantidad requerida para verificar stock inmediato y confirmar el total.",
  },
  {
    number: "03",
    title: "Pago por Transferencia Bancaria",
    description: "Realiza el pago seguro vía transferencia directa a la cuenta de la asociación productora y comparte el comprobante.",
  },
  {
    number: "04",
    title: "Entrega a domicilio o Retiro en Planta",
    description: "Coordinamos la entrega directa en Ambato y sectores aledaños o retira tus productos frescos en Pilahuín.",
  },
];

export default function ComoComprarPage() {
  const whatsappUrl = buildWhatsAppUrl({
    message: "Hola CONLAC-T, deseo realizar un pedido asistido de quesos artesanales.",
  });

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container className="space-y-16">
        <div className="max-w-2xl">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Guía de Pedidos
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            ¿Cómo Comprar en CONLAC-T?
          </h1>
          <p className="mt-3 text-base text-neutral-muted">
            Un proceso directo, transparente y solidario que apoya a los productores de Tungurahua.
          </p>
        </div>

        {/* Pasos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="font-headline text-3xl font-bold text-tertiary">
                  {step.number}
                </span>
                <h2 className="mt-2 font-headline text-lg font-bold text-primary">
                  {step.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-neutral-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Banner CTA */}
        <div className="p-8 sm:p-12 rounded-2xl bg-surface border border-tertiary/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary">
              ¿Listo para ordenar tus quesos?
            </h2>
            <p className="text-sm text-neutral-muted mt-1">
              Atendemos tus pedidos y consultas de forma personalizada de lunes a domingo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
            <Button href="/tienda" variant="primary">
              <span>Ver catálogo</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
            <Button href={whatsappUrl} variant="outlined" isExternal>
              <WhatsAppIcon className="w-4 h-4" />
              <span>Pedir por WhatsApp</span>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
