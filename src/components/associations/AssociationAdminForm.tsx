"use client";

import React, { FormEvent, useState } from "react";
import type { AssociationFormData } from "@/types/index";
import { createAssociation } from "@/services/asociaciones/associationService";

type FormErrors = Partial<
  Record<keyof AssociationFormData, string>
>;

const initialFormData: AssociationFormData = {
  slug: "",
  name: "",
  shortDescription: "",
  history: "",

  locationText: "",
  latitude: "",
  longitude: "",

  arcsaRegistration: "",
  agrocalidadRegistration: "",
  sanitarySealText: "",

  videoUrl: "",

  instagramUrl: "",
  tiktokUrl: "",
  facebookUrl: "",
  whatsapp: "",

  isPublished: false,
};

export function AssociationAdminForm() {
  const [formData, setFormData] =
    useState<AssociationFormData>(initialFormData);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [status, setStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const updateField = <
    K extends keyof AssociationFormData
  >(
    field: K,
    value: AssociationFormData[K]
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setStatus("idle");
  };

  const validateForm = (): FormErrors => {
    const validationErrors: FormErrors = {};

    // ============================
    // NOMBRE
    // ============================

    if (!formData.name.trim()) {
      validationErrors.name =
        "El nombre de la asociación es obligatorio.";
    }

    // ============================
    // SLUG
    // ============================

    if (!formData.slug.trim()) {
      validationErrors.slug =
        "El slug es obligatorio.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        formData.slug.trim()
      )
    ) {
      validationErrors.slug =
        "El slug solo puede contener letras minúsculas, números y guiones.";
    }

    // ============================
    // DESCRIPCIÓN
    // ============================

    if (
      formData.shortDescription.trim() &&
      formData.shortDescription.trim().length < 10
    ) {
      validationErrors.shortDescription =
        "La descripción debe tener al menos 10 caracteres.";
    }

    // ============================
    // HISTORIA
    // ============================

    if (!formData.history.trim()) {
      validationErrors.history =
        "La historia de la asociación es obligatoria.";
    }

    // ============================
    // UBICACIÓN
    // ============================

    if (!formData.locationText.trim()) {
      validationErrors.locationText =
        "La ubicación es obligatoria.";
    }

    // ============================
    // LATITUD
    // ============================

    if (formData.latitude.trim()) {
      const latitude = Number(
        formData.latitude
      );

      if (
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        validationErrors.latitude =
          "La latitud debe estar entre -90 y 90.";
      }
    }

    // ============================
    // LONGITUD
    // ============================

    if (formData.longitude.trim()) {
      const longitude = Number(
        formData.longitude
      );

      if (
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        validationErrors.longitude =
          "La longitud debe estar entre -180 y 180.";
      }
    }

    // ============================
    // VIDEO
    // ============================

    if (formData.videoUrl.trim()) {
      try {
        new URL(formData.videoUrl.trim());
      } catch {
        validationErrors.videoUrl =
          "Ingrese una URL de video válida.";
      }
    }

    // ============================
    // INSTAGRAM
    // ============================

    if (formData.instagramUrl.trim()) {
      try {
        new URL(formData.instagramUrl.trim());
      } catch {
        validationErrors.instagramUrl =
          "Ingrese una URL válida de Instagram.";
      }
    }

    // ============================
    // TIKTOK
    // ============================

    if (formData.tiktokUrl.trim()) {
      try {
        new URL(formData.tiktokUrl.trim());
      } catch {
        validationErrors.tiktokUrl =
          "Ingrese una URL válida de TikTok.";
      }
    }

    // ============================
    // FACEBOOK
    // ============================

    if (formData.facebookUrl.trim()) {
      try {
        new URL(formData.facebookUrl.trim());
      } catch {
        validationErrors.facebookUrl =
          "Ingrese una URL válida de Facebook.";
      }
    }

    // ============================
    // WHATSAPP
    // ============================

    if (formData.whatsapp.trim()) {
      const whatsapp = formData.whatsapp.replace(
        /\D/g,
        ""
      );

      if (
        whatsapp.length < 10 ||
        whatsapp.length > 15
      ) {
        validationErrors.whatsapp =
          "Ingrese un número de WhatsApp válido.";
      }
    }

    return validationErrors;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setStatus("idle");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    try {
      const association = {
        slug: formData.slug.trim(),
        name: formData.name.trim(),
        shortDescription:
          formData.shortDescription.trim() || undefined,
        history:
          formData.history.trim() || undefined,

        locationText:
          formData.locationText.trim() || undefined,

        latitude:
          formData.latitude.trim()
            ? Number(formData.latitude)
            : undefined,

        longitude:
          formData.longitude.trim()
            ? Number(formData.longitude)
            : undefined,

        arcsaRegistration:
          formData.arcsaRegistration.trim() || undefined,

        agrocalidadRegistration:
          formData.agrocalidadRegistration.trim() || undefined,

        sanitarySealText:
          formData.sanitarySealText.trim() || undefined,

        videoUrl:
          formData.videoUrl.trim() || undefined,

        instagramUrl:
          formData.instagramUrl.trim() || undefined,

        tiktokUrl:
          formData.tiktokUrl.trim() || undefined,

        facebookUrl:
          formData.facebookUrl.trim() || undefined,

        whatsapp:
          formData.whatsapp.trim() || undefined,

        isPublished: formData.isPublished,
      };

      await createAssociation(association);

      setStatus("success");
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      console.error(
        "Error al crear la asociación:",
        error
      );

      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8"
    >
      {/* ==========================================
          INFORMACIÓN GENERAL
          ========================================== */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Información general
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Información principal de la asociación.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* SLUG */}

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Slug <span className="text-red-600">*</span>
            </label>

            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(event) =>
                updateField(
                  "slug",
                  event.target.value
                )
              }
              placeholder="asociacion-san-pedro"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.slug
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.slug && (
              <p className="mt-2 text-sm text-red-600">
                {errors.slug}
              </p>
            )}

            <p className="mt-1 text-xs text-neutral-muted">
              Se utilizará en la URL de la asociación.
            </p>
          </div>

          {/* NOMBRE */}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Nombre de la asociación{" "}
              <span className="text-red-600">*</span>
            </label>

            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="Asociación San Pedro"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.name
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.name && (
              <p className="mt-2 text-sm text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* DESCRIPCIÓN CORTA */}

          <div className="md:col-span-2">
            <label
              htmlFor="shortDescription"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Descripción corta
            </label>

            <textarea
              id="shortDescription"
              rows={3}
              value={
                formData.shortDescription
              }
              onChange={(event) =>
                updateField(
                  "shortDescription",
                  event.target.value
                )
              }
              placeholder="Breve descripción de la asociación..."
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.shortDescription
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.shortDescription && (
              <p className="mt-2 text-sm text-red-600">
                {errors.shortDescription}
              </p>
            )}
          </div>

          {/* HISTORIA */}

          <div className="md:col-span-2">
            <label
              htmlFor="history"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Historia
            </label>

            <textarea
              id="history"
              rows={7}
              value={formData.history}
              onChange={(event) =>
                updateField(
                  "history",
                  event.target.value
                )
              }
              placeholder="Historia de la asociación..."
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.history
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.history && (
              <p className="mt-2 text-sm text-red-600">
                {errors.history}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          UBICACIÓN
          ========================================== */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Ubicación
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Ubicación física y coordenadas geográficas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* UBICACIÓN */}

          <div className="md:col-span-2">
            <label
              htmlFor="locationText"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Ubicación
            </label>

            <input
              id="locationText"
              type="text"
              value={formData.locationText}
              onChange={(event) =>
                updateField(
                  "locationText",
                  event.target.value
                )
              }
              placeholder="Pilahuín, Tungurahua, Ecuador"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.locationText
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.locationText && (
              <p className="mt-2 text-sm text-red-600">
                {errors.locationText}
              </p>
            )}
          </div>

          {/* LATITUD */}

          <div>
            <label
              htmlFor="latitude"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Latitud
            </label>

            <input
              id="latitude"
              type="number"
              step="0.000001"
              value={formData.latitude}
              onChange={(event) =>
                updateField(
                  "latitude",
                  event.target.value
                )
              }
              placeholder="-1.234567"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.latitude
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.latitude && (
              <p className="mt-2 text-sm text-red-600">
                {errors.latitude}
              </p>
            )}
          </div>

          {/* LONGITUD */}

          <div>
            <label
              htmlFor="longitude"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Longitud
            </label>

            <input
              id="longitude"
              type="number"
              step="0.000001"
              value={formData.longitude}
              onChange={(event) =>
                updateField(
                  "longitude",
                  event.target.value
                )
              }
              placeholder="-78.123456"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.longitude
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.longitude && (
              <p className="mt-2 text-sm text-red-600">
                {errors.longitude}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          REGISTROS SANITARIOS
          ========================================== */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Registros sanitarios
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Información relacionada con ARCSA y Agrocalidad.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* ARCSA */}

          <div>
            <label
              htmlFor="arcsaRegistration"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Registro ARCSA
            </label>

            <input
              id="arcsaRegistration"
              type="text"
              value={
                formData.arcsaRegistration
              }
              onChange={(event) =>
                updateField(
                  "arcsaRegistration",
                  event.target.value
                )
              }
              placeholder="Registro ARCSA"
              className="w-full rounded-xl border border-border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary"
            />
          </div>

          {/* AGROCALIDAD */}

          <div>
            <label
              htmlFor="agrocalidadRegistration"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Registro Agrocalidad
            </label>

            <input
              id="agrocalidadRegistration"
              type="text"
              value={
                formData.agrocalidadRegistration
              }
              onChange={(event) =>
                updateField(
                  "agrocalidadRegistration",
                  event.target.value
                )
              }
              placeholder="Registro Agrocalidad"
              className="w-full rounded-xl border border-border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary"
            />
          </div>

          {/* SELLO SANITARIO */}

          <div className="md:col-span-2">
            <label
              htmlFor="sanitarySealText"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Sello sanitario
            </label>

            <input
              id="sanitarySealText"
              type="text"
              value={
                formData.sanitarySealText
              }
              onChange={(event) =>
                updateField(
                  "sanitarySealText",
                  event.target.value
                )
              }
              placeholder="Información del sello sanitario"
              className="w-full rounded-xl border border-border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary"
            />
          </div>
        </div>
      </section>

      {/* ==========================================
          MULTIMEDIA
          ========================================== */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Multimedia
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Video relacionado con la asociación.
          </p>
        </div>

        <div>
          <label
            htmlFor="videoUrl"
            className="mb-2 block text-sm font-semibold text-primary"
          >
            URL del video
          </label>

          <input
            id="videoUrl"
            type="url"
            value={formData.videoUrl}
            onChange={(event) =>
              updateField(
                "videoUrl",
                event.target.value
              )
            }
            placeholder="https://www.youtube.com/watch?v=..."
            className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.videoUrl
              ? "border-red-500 focus:ring-red-200"
              : "border-border"
              }`}
          />

          {errors.videoUrl && (
            <p className="mt-2 text-sm text-red-600">
              {errors.videoUrl}
            </p>
          )}
        </div>
      </section>

      {/* ==========================================
          CONTACTO Y REDES
          ========================================== */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Contacto y redes sociales
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Información de contacto público de la asociación.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* WHATSAPP */}

          <div>
            <label
              htmlFor="whatsapp"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              WhatsApp
            </label>

            <input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(event) =>
                updateField(
                  "whatsapp",
                  event.target.value
                )
              }
              placeholder="593987654321"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.whatsapp
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.whatsapp && (
              <p className="mt-2 text-sm text-red-600">
                {errors.whatsapp}
              </p>
            )}
          </div>

          {/* INSTAGRAM */}

          <div>
            <label
              htmlFor="instagramUrl"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Instagram
            </label>

            <input
              id="instagramUrl"
              type="url"
              value={
                formData.instagramUrl
              }
              onChange={(event) =>
                updateField(
                  "instagramUrl",
                  event.target.value
                )
              }
              placeholder="https://instagram.com/..."
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.instagramUrl
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.instagramUrl && (
              <p className="mt-2 text-sm text-red-600">
                {errors.instagramUrl}
              </p>
            )}
          </div>

          {/* TIKTOK */}

          <div>
            <label
              htmlFor="tiktokUrl"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              TikTok
            </label>

            <input
              id="tiktokUrl"
              type="url"
              value={formData.tiktokUrl}
              onChange={(event) =>
                updateField(
                  "tiktokUrl",
                  event.target.value
                )
              }
              placeholder="https://tiktok.com/@..."
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.tiktokUrl
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.tiktokUrl && (
              <p className="mt-2 text-sm text-red-600">
                {errors.tiktokUrl}
              </p>
            )}
          </div>

          {/* FACEBOOK */}

          <div>
            <label
              htmlFor="facebookUrl"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Facebook
            </label>

            <input
              id="facebookUrl"
              type="url"
              value={
                formData.facebookUrl
              }
              onChange={(event) =>
                updateField(
                  "facebookUrl",
                  event.target.value
                )
              }
              placeholder="https://facebook.com/..."
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${errors.facebookUrl
                ? "border-red-500 focus:ring-red-200"
                : "border-border"
                }`}
            />

            {errors.facebookUrl && (
              <p className="mt-2 text-sm text-red-600">
                {errors.facebookUrl}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ==========================================
          PUBLICACIÓN
          ========================================== */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <input
            id="isPublished"
            type="checkbox"
            checked={formData.isPublished}
            onChange={(event) =>
              updateField(
                "isPublished",
                event.target.checked
              )
            }
            className="mt-1 h-5 w-5 rounded border-border"
          />

          <div>
            <label
              htmlFor="isPublished"
              className="block cursor-pointer text-sm font-semibold text-primary"
            >
              Publicar asociación
            </label>

            <p className="mt-1 text-sm text-neutral-muted">
              Si está activado, la asociación podrá aparecer en las consultas públicas.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          MENSAJES
          ========================================== */}

      {status === "success" && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700"
        >
          La asociación se creó correctamente.
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          Ocurrió un error al crear la asociación.
          Verifique la conexión con el backend e inténtelo nuevamente.
        </div>
      )}

      {/* ==========================================
          BOTÓN
          ========================================== */}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : "Guardar asociación"}
        </button>
      </div>
    </form>
  );
}

export default AssociationAdminForm;