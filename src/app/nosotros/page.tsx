import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UsersIcon, MountainIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Nosotros | Consorcio CONLAC-T",
  description: "Historia, valores y misión del Consorcio de Lácteos de Tungurahua (CONLAC-T).",
};

export default function NosotrosPage() {
  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container className="space-y-16">
        
        {/* Encabezado */}
        <div className="max-w-3xl">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Nuestra Identidad
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-headline font-bold text-primary">
            Consorcio de Lácteos de Tungurahua
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-muted leading-relaxed">
            Nacemos de la unión cooperativa de familias productoras de las zonas altas
            de Pilahuín y comunidades vecinas de Tungurahua, con el propósito de dignificar
            el trabajo rural campesino e indígena y ofrecer productos lácteos de pureza insuperable.
          </p>
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-inverted">
              <UsersIcon className="h-6 w-6" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-primary">Nuestra Misión</h2>
            <p className="text-sm text-neutral-muted leading-relaxed">
              Fomentar el desarrollo socioeconómico de las asociaciones de pequeños y medianos
              ganaderos de Tungurahua mediante el procesamiento tecnificado e higiénico de derivados
              lácteos con identidad andina, promoviendo el comercio justo directo del productor al consumidor.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-inverted">
              <MountainIcon className="h-6 w-6" />
            </div>
            <h2 className="font-headline text-2xl font-bold text-primary">Nuestra Visión</h2>
            <p className="text-sm text-neutral-muted leading-relaxed">
              Ser el referente de la quesería artesanal de altura en el Ecuador, reconocidos
              por la excelencia de nuestros quesos con denominación de origen, sostenibilidad
              agroecológica en el páramo y liderazgo comunitario.
            </p>
          </div>
        </div>

        {/* Sellos de Calidad */}
        <div id="calidad" className="p-8 sm:p-12 rounded-2xl bg-[#184332] text-[#F8F4E9] space-y-6">
          <div className="max-w-2xl space-y-2">
            <Badge variant="tertiary">Garantía Sanitaria</Badge>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#F8F4E9]">
              Buenas Prácticas de Manufactura (BPM)
            </h2>
            <p className="text-sm text-[#F8F4E9]/80 leading-relaxed">
              Cada planta asociada cuenta con asesoría técnica permanente, control de calidad microbiológico
              y trazabilidad integral desde el ordeño matutino en las praderas de Pilahuín hasta el empacado final.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <Button href="/tienda" variant="inverted">
              Conoce nuestros quesos
            </Button>
            <Button href="/contacto" variant="outlined" className="border-inverted text-inverted hover:bg-inverted hover:text-primary">
              Contáctanos
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
