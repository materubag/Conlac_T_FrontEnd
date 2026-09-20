"use client";

import React, { FormEvent, useState } from "react";
import type { Asociacion } from "@/types";

interface AssociationFormData {
  nombre: string;
  parroquia: string;
  numero_familias: string;
  anio_fundacion: string;
  registro_arcsa: string;
  fecha_emision: string;
  estado_vigencia: string;
  foto_principal: string;
  galeria: string[];
  video_url: string;
  lat: string;
  lng: string;
  referencia_vial: string;
  historia: string;
}

type FormErrors = Partial<
  Record<keyof AssociationFormData, string>
>;

const initialFormData: AssociationFormData = {
  nombre: "",
  parroquia: "",
  numero_familias: "",
  anio_fundacion: "",
  registro_arcsa: "",
  fecha_emision: "",
  estado_vigencia: "",
  foto_principal: "",
  galeria: [""],
  video_url: "",
  lat: "",
  lng: "",
  referencia_vial: "",
  historia: "",
};

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

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

  const [showValidationMessage, setShowValidationMessage] =
    useState(false);

  const currentYear = new Date().getFullYear();

  const updateField = (
    field: keyof AssociationFormData,
    value: string
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

  const updateGalleryImage = (
    index: number,
    value: string
  ) => {
    setFormData((previous) => {
      const gallery = [...previous.galeria];

      gallery[index] = value;

      return {
        ...previous,
        galeria: gallery,
      };
    });

    setErrors((previous) => ({
      ...previous,
      galeria: undefined,
    }));

    setStatus("idle");
  };

  const addGalleryImage = () => {
    setFormData((previous) => ({
      ...previous,
      galeria: [...previous.galeria, ""],
    }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData((previous) => {
      const gallery = previous.galeria.filter(
        (_, galleryIndex) =>
          galleryIndex !== index
      );

      return {
        ...previous,
        galeria:
          gallery.length > 0 ? gallery : [""],
      };
    });

    setErrors((previous) => ({
      ...previous,
      galeria: undefined,
    }));
  };

  const validateForm = (): FormErrors => {
    const validationErrors: FormErrors = {};

    // Datos generales

    if (!formData.nombre.trim()) {
      validationErrors.nombre =
        "El nombre de la asociación es obligatorio.";
    }

    if (!formData.parroquia.trim()) {
      validationErrors.parroquia =
        "La parroquia o comunidad es obligatoria.";
    }

    if (!formData.numero_familias.trim()) {
      validationErrors.numero_familias =
        "El número de familias socias es obligatorio.";
    } else {
      const families = Number(
        formData.numero_familias
      );

      if (
        !Number.isInteger(families) ||
        families < 1
      ) {
        validationErrors.numero_familias =
          "Ingrese un número entero mayor o igual a 1.";
      }
    }

    if (!formData.anio_fundacion.trim()) {
      validationErrors.anio_fundacion =
        "El año de fundación es obligatorio.";
    } else {
      const year = Number(
        formData.anio_fundacion
      );

      if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > currentYear
      ) {
        validationErrors.anio_fundacion =
          "Ingrese un año entre 1900 y " +
          currentYear +
          ".";
      }
    }

    // Certificación sanitaria

    if (
      formData.registro_arcsa.trim() &&
      formData.registro_arcsa.trim().length < 3
    ) {
      validationErrors.registro_arcsa =
        "Ingrese un código ARCSA/BPM válido.";
    }

    if (formData.fecha_emision.trim()) {
      const emissionDate = new Date(
        formData.fecha_emision + "T00:00:00"
      );

      if (Number.isNaN(emissionDate.getTime())) {
        validationErrors.fecha_emision =
          "Ingrese una fecha válida.";
      }
    }

    // Multimedia

    if (
      formData.foto_principal.trim() &&
      !isValidUrl(
        formData.foto_principal.trim()
      )
    ) {
      validationErrors.foto_principal =
        "Ingrese una URL válida que comience con http:// o https://.";
    }

    if (
      formData.video_url.trim() &&
      !isValidUrl(formData.video_url.trim())
    ) {
      validationErrors.video_url =
        "Ingrese una URL válida de YouTube o Vimeo.";
    }

    const invalidGalleryUrl =
      formData.galeria.some(
        (url) =>
          url.trim().length > 0 &&
          !isValidUrl(url.trim())
      );

    if (invalidGalleryUrl) {
      validationErrors.galeria =
        "Una o más imágenes de la galería tienen una URL inválida.";
    }

    // Ubicación

    if (!formData.lat.trim()) {
      validationErrors.lat =
        "La latitud es obligatoria.";
    } else {
      const latitude = Number(formData.lat);

      if (
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        validationErrors.lat =
          "La latitud debe estar entre -90 y 90.";
      }
    }

    if (!formData.lng.trim()) {
      validationErrors.lng =
        "La longitud es obligatoria.";
    } else {
      const longitude = Number(formData.lng);

      if (
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        validationErrors.lng =
          "La longitud debe estar entre -180 y 180.";
      }
    }

    if (!formData.referencia_vial.trim()) {
      validationErrors.referencia_vial =
        "La referencia vial es obligatoria.";
    }

    // Historia

    if (!formData.historia.trim()) {
      validationErrors.historia =
        "La historia y descripción son obligatorias.";
    } else if (
      formData.historia.trim().length < 20
    ) {
      validationErrors.historia =
        "La descripción debe tener al menos 20 caracteres.";
    }

    return validationErrors;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const validationErrors = validateForm();

    setErrors(validationErrors);
    setStatus("idle");

    const hasErrors =
      Object.keys(validationErrors).length > 0;

    setShowValidationMessage(hasErrors);

    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);

    try {
      const fotos = [
        formData.foto_principal.trim(),
        ...formData.galeria
          .map((url) => url.trim())
          .filter((url) => url.length > 0),
      ];

      const asociacion: Omit<
        Asociacion,
        "id"
      > = {
        nombre: formData.nombre.trim(),
        historia: formData.historia.trim(),
        fotos,
        video_url:
          formData.video_url.trim() ||
          undefined,
        sello_sanitario:
          formData.registro_arcsa.trim() ||
          undefined,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
      };

      const response = await fetch(
        "/api/asociaciones",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(asociacion),
        }
      );

      if (!response.ok) {
        throw new Error(
          "No se pudo guardar la asociación."
        );
      }

      await response.json();

      setStatus("success");
      setShowValidationMessage(false);
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      console.error(error);
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
      {/* DATOS GENERALES */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Datos Generales
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Información principal de la asociación.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="nombre"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Nombre de la asociación{" "}
              <span className="text-red-600">
                *
              </span>
            </label>

            <input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(event) =>
                updateField(
                  "nombre",
                  event.target.value
                )
              }
              aria-invalid={!!errors.nombre}
              aria-describedby={
                errors.nombre
                  ? "nombre-error"
                  : undefined
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.nombre
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder="Ej. Asociación San Pedro"
            />

            {errors.nombre && (
              <p
                id="nombre-error"
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.nombre}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="parroquia"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Parroquia o comunidad{" "}
              <span className="text-red-600">
                *
              </span>
            </label>

            <input
              id="parroquia"
              type="text"
              value={formData.parroquia}
              onChange={(event) =>
                updateField(
                  "parroquia",
                  event.target.value
                )
              }
              aria-invalid={!!errors.parroquia}
              aria-describedby={
                errors.parroquia
                  ? "parroquia-error"
                  : undefined
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.parroquia
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder="Ej. Pilahuín"
            />

            {errors.parroquia && (
              <p
                id="parroquia-error"
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.parroquia}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="numero_familias"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Número de familias socias{" "}
              <span className="text-red-600">
                *
              </span>
            </label>

            <input
              id="numero_familias"
              type="number"
              min="1"
              value={formData.numero_familias}
              onChange={(event) =>
                updateField(
                  "numero_familias",
                  event.target.value
                )
              }
              aria-invalid={
                !!errors.numero_familias
              }
              aria-describedby={
                errors.numero_familias
                  ? "numero-familias-error"
                  : undefined
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.numero_familias
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder="Ej. 25"
            />

            {errors.numero_familias && (
              <p
                id="numero-familias-error"
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.numero_familias}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="anio_fundacion"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Año de fundación{" "}
              <span className="text-red-600">
                *
              </span>
            </label>

            <input
              id="anio_fundacion"
              type="number"
              min="1900"
              max={currentYear}
              value={formData.anio_fundacion}
              onChange={(event) =>
                updateField(
                  "anio_fundacion",
                  event.target.value
                )
              }
              aria-invalid={
                !!errors.anio_fundacion
              }
              aria-describedby={
                errors.anio_fundacion
                  ? "anio-fundacion-error"
                  : undefined
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.anio_fundacion
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder={String(currentYear)}
            />

            {errors.anio_fundacion && (
              <p
                id="anio-fundacion-error"
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.anio_fundacion}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CERTIFICACIÓN SANITARIA */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Certificación Sanitaria
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Información relacionada con ARCSA y BPM.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label
              htmlFor="registro_arcsa"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Código de Registro ARCSA / BPM
            </label>

            <input
              id="registro_arcsa"
              type="text"
              value={formData.registro_arcsa}
              onChange={(event) =>
                updateField(
                  "registro_arcsa",
                  event.target.value
                )
              }
              aria-invalid={
                !!errors.registro_arcsa
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.registro_arcsa
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder="Código ARCSA/BPM"
            />

            {errors.registro_arcsa && (
              <p
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.registro_arcsa}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="fecha_emision"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Fecha de emisión
            </label>

            <input
              id="fecha_emision"
              type="date"
              value={formData.fecha_emision}
              onChange={(event) =>
                updateField(
                  "fecha_emision",
                  event.target.value
                )
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.fecha_emision
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
            />

            {errors.fecha_emision && (
              <p
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.fecha_emision}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="estado_vigencia"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Estado de vigencia
            </label>

            <select
              id="estado_vigencia"
              value={formData.estado_vigencia}
              onChange={(event) =>
                updateField(
                  "estado_vigencia",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary"
            >
              <option value="">
                Seleccione un estado
              </option>
              <option value="Vigente">
                Vigente
              </option>
              <option value="Por vencer">
                Por vencer
              </option>
              <option value="Vencido">
                Vencido
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* MULTIMEDIA */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Multimedia
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Fotografías y video de la asociación.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="foto_principal"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              URL de foto principal
            </label>

            <input
              id="foto_principal"
              type="url"
              value={formData.foto_principal}
              onChange={(event) =>
                updateField(
                  "foto_principal",
                  event.target.value
                )
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.foto_principal
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder="https://ejemplo.com/foto.jpg"
            />

            {errors.foto_principal && (
              <p
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.foto_principal}
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="block text-sm font-semibold text-primary">
                Galería de imágenes
              </label>

              <button
                type="button"
                onClick={addGalleryImage}
                className="shrink-0 text-sm font-semibold text-primary hover:underline"
              >
                + Agregar imagen
              </button>
            </div>

            <div className="space-y-3">
              {formData.galeria.map(
                (url, index) => (
                  <div
                    key={index}
                    className="flex gap-2"
                  >
                    <input
                      type="url"
                      value={url}
                      onChange={(event) =>
                        updateGalleryImage(
                          index,
                          event.target.value
                        )
                      }
                      className={`min-w-0 flex-1 rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                        errors.galeria
                          ? "border-red-500 focus:ring-red-200"
                          : "border-border"
                      }`}
                      placeholder="https://ejemplo.com/galeria.jpg"
                    />

                    {formData.galeria.length >
                      1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeGalleryImage(
                            index
                          )
                        }
                        className="rounded-xl border border-border px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                )
              )}
            </div>

            {errors.galeria && (
              <p
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.galeria}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="video_url"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Enlace de YouTube / Vimeo
            </label>

            <input
              id="video_url"
              type="url"
              value={formData.video_url}
              onChange={(event) =>
                updateField(
                  "video_url",
                  event.target.value
                )
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.video_url
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder="https://www.youtube.com/..."
            />

            {errors.video_url && (
              <p
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.video_url}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Ubicación
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Coordenadas y referencia de ubicación.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="lat"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Latitud{" "}
              <span className="text-red-600">
                *
              </span>
            </label>

            <input
              id="lat"
              type="number"
              step="any"
              value={formData.lat}
              onChange={(event) =>
                updateField(
                  "lat",
                  event.target.value
                )
              }
              aria-invalid={!!errors.lat}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.lat
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder="-1.234567"
            />

            {errors.lat && (
              <p
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.lat}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lng"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Longitud{" "}
              <span className="text-red-600">
                *
              </span>
            </label>

            <input
              id="lng"
              type="number"
              step="any"
              value={formData.lng}
              onChange={(event) =>
                updateField(
                  "lng",
                  event.target.value
                )
              }
              aria-invalid={!!errors.lng}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.lng
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder="-78.123456"
            />

            {errors.lng && (
              <p
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.lng}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="referencia_vial"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Referencia vial{" "}
              <span className="text-red-600">
                *
              </span>
            </label>

            <input
              id="referencia_vial"
              type="text"
              value={formData.referencia_vial}
              onChange={(event) =>
                updateField(
                  "referencia_vial",
                  event.target.value
                )
              }
              aria-invalid={
                !!errors.referencia_vial
              }
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
                errors.referencia_vial
                  ? "border-red-500 focus:ring-red-200"
                  : "border-border"
              }`}
              placeholder="Ej. Vía Ambato--Guaranda"
            />

            {errors.referencia_vial && (
              <p
                role="alert"
                className="mt-2 text-sm font-medium text-red-600"
              >
                {errors.referencia_vial}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* HISTORIA */}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">
            Historia y Descripción
          </h2>

          <p className="mt-1 text-sm text-neutral-muted">
            Describe la historia, actividades y características de la asociación.
          </p>
        </div>

        <textarea
          id="historia"
          rows={7}
          maxLength={1000}
          value={formData.historia}
          onChange={(event) =>
            updateField(
              "historia",
              event.target.value
            )
          }
          aria-invalid={!!errors.historia}
          className={`w-full resize-y rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-tertiary ${
            errors.historia
              ? "border-red-500 focus:ring-red-200"
              : "border-border"
          }`}
          placeholder="Escribe aquí la historia y descripción de la asociación..."
        />

        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            {errors.historia && (
              <p
                role="alert"
                className="text-sm font-medium text-red-600"
              >
                {errors.historia}
              </p>
            )}
          </div>

          <p className="shrink-0 text-xs text-neutral-muted">
            {formData.historia.length}/1000
            caracteres
          </p>
        </div>
      </section>

      {/* INFORMACIÓN DE CAMPOS OBLIGATORIOS */}

      <div className="rounded-xl border border-border bg-neutral-light/30 px-4 py-3">
        <p className="text-sm text-neutral-muted">
          Los campos marcados con{" "}
          <span className="font-bold text-red-600">
            *
          </span>{" "}
          son obligatorios.
        </p>
      </div>

      {/* MENSAJES */}

      {status === "success" && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
        >
          La asociación se guardó correctamente.
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          No se pudo guardar la asociación.
          Inténtalo nuevamente.
        </div>
      )}

      {/* BOTÓN */}

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
        {showValidationMessage && (
          <p
            role="alert"
            className="text-sm font-semibold text-red-600"
          >
            Hay errores en algunos campos.
            Revisa la información antes de guardar.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-inverted shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          )}

          {isSubmitting
            ? "Guardando..."
            : "Guardar asociación"}
        </button>
      </div>
    </form>
  );
}
