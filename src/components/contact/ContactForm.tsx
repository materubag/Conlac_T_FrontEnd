"use client";
import { Button } from "@/components/ui/Button";
import { sendContactMessage } from "@/services/contacto/contactService";
import type { ContactMessageRequest } from "@/types";
import React, { useState } from "react";
export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactMessageRequest>({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
    privacy_accepted: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validación básica en frontend
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.asunto.trim() || !formData.mensaje.trim()) {
      setErrorMessage("Por favor complete todos los campos obligatorios (*).");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await sendContactMessage({
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono?.trim() || "",
        asunto: formData.asunto.trim(),
        mensaje: formData.mensaje.trim(),
        privacy_accepted: Boolean(
          formData.privacy_accepted
        ),
      });

      setSuccessMessage(
        data.message ||
        "Mensaje enviado exitosamente. Nos comunicaremos a la brevedad."
      );

      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        asunto: "",
        mensaje: "",
        privacy_accepted: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar el mensaje";
      setErrorMessage(`No se pudo enviar el mensaje: ${msg}. Intente nuevamente o use WhatsApp.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-surface border border-border p-6 sm:p-10 shadow-sm">
      <div className="mb-8">
        <h2 className="font-headline text-2xl font-bold text-primary">
          Envíanos un Mensaje Directo
        </h2>
        <p className="mt-2 text-sm text-neutral-muted">
          Completa el formulario para consultas comerciales, pedidos comunitarios o información institucional.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-300 p-5 text-emerald-900">
          <div className="flex items-center gap-2 font-semibold font-label text-emerald-800">
            <span>✓ Mensaje Registrado con Éxito</span>
          </div>
          <p className="mt-1 text-sm">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-300 p-5 text-red-900">
          <div className="flex items-center gap-2 font-semibold font-label text-red-800">
            <span>⚠ Notificación</span>
          </div>
          <p className="mt-1 text-sm">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-xs font-label uppercase font-bold text-primary mb-2">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Carmen Salazar"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-label uppercase font-bold text-primary mb-2">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-xs font-label uppercase font-bold text-primary mb-2">
              Teléfono / Celular (Opcional)
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="099 123 4567"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
            />
          </div>

          {/* Asunto */}
          <div>
            <label htmlFor="asunto" className="block text-xs font-label uppercase font-bold text-primary mb-2">
              Asunto <span className="text-red-500">*</span>
            </label>
            <select
              id="asunto"
              name="asunto"
              required
              value={formData.asunto}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
            >
              <option value="">Seleccione un motivo...</option>
              <option value="Consulta sobre pedidos al por mayor">Pedidos al por mayor</option>
              <option value="Consulta sobre productos y catálogo">Información de catálogo</option>
              <option value="Visitas técnicas y turismo comunitario">Turismo y visitas a plantas</option>
              <option value="Alianzas comunitarias e institucionales">Alianzas institucionales</option>
              <option value="Otra consulta">Otra consulta</option>
            </select>
          </div>
        </div>

        {/* Mensaje */}
        <div>
          <label htmlFor="mensaje" className="block text-xs font-label uppercase font-bold text-primary mb-2">
            Mensaje o Requerimiento <span className="text-red-500">*</span>
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            required
            rows={4}
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Describa su consulta o pedido en detalle..."
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary resize-y"
          />
        </div>

        {/* Términos y privacidad */}
        <div className="flex items-center gap-3">
          <input
            id="privacy_accepted"
            name="privacy_accepted"
            type="checkbox"
            checked={formData.privacy_accepted}
            onChange={handleChange}
            className="h-4 w-4 rounded border-border text-primary focus:ring-tertiary"
          />
          <label htmlFor="privacy_accepted" className="text-xs text-neutral-muted">
            Acepto que los datos provistos sean procesados por CONLAC-T para coordinar la respuesta.
          </label>
        </div>

        {/* Botón enviar */}
        <div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Enviando mensaje..." : "Enviar Mensaje"}
          </Button>
        </div>
      </form>
    </div>
  );
};
