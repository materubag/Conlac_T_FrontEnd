import React from "react";
import { buildWhatsAppUrl } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/Icons";

interface WhatsAppFloatingButtonProps {
  customMessage?: string;
}

/**
 * ============================================================
 * BOTÓN FLOTANTE PERSISTENTE DE WHATSAPP - CONLAC-T
 * ============================================================
 * 
 * CTA persistente para contacto asistido directo y resolución de dudas.
 * Utiliza la función centralizada buildWhatsAppUrl() sin hardcodear números ni textos.
 */
export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  customMessage,
}) => {
  const whatsappUrl = buildWhatsAppUrl({ message: customMessage });

  return (
    <aside
      aria-label="Canal de atención directa por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center group"
    >
      {/* Tooltip accesible de escritorio */}
      <span className="hidden sm:inline-block mr-3 px-3 py-1.5 rounded-lg bg-neutral text-inverted text-xs font-label font-medium shadow-md opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
        ¿Dudas o pedidos? Escríbenos
      </span>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp para atención directa y pedidos"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20BA5A] hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:ring-4 focus-visible:ring-tertiary focus-visible:outline-none"
      >
        <WhatsAppIcon className="w-8 h-8 text-white fill-current" />
        
        {/* Indicador de pulso accesible */}
        <span
          className="absolute -top-1 -right-1 flex h-3.5 w-3.5"
          aria-hidden="true"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#184332]" />
        </span>
      </a>
    </aside>
  );
};
