"use client";

import React, { FormEvent, useState } from "react";

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

export const AssociationAdminForm: React.FC = () => {
    const [formData, setFormData] =
        useState<AssociationFormData>(initialFormData);

    type FormErrors = Partial<Record<keyof AssociationFormData, string>>;

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleChange = (
        field: keyof AssociationFormData,
        value: string
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => {
            const updatedErrors = { ...current };
            delete updatedErrors[field];

            return updatedErrors;
        });

        setStatus("idle");
    };
    const handleGalleryChange = (index: number, value: string) => {
        setFormData((current) => {
            const galeria = [...current.galeria];
            galeria[index] = value;

            return {
                ...current,
                galeria,
            };
        });

        setErrors((current) => {
            const updatedErrors = { ...current };
            delete updatedErrors.galeria;
            return updatedErrors;
        });

        setStatus("idle");
    };

    const addGalleryField = () => {
        setFormData((current) => ({
            ...current,
            galeria: [...current.galeria, ""],
        }));
    };

    const removeGalleryField = (index: number) => {
        setFormData((current) => {
            const galeria = current.galeria.filter(
                (_, currentIndex) => currentIndex !== index
            );

            return {
                ...current,
                galeria: galeria.length > 0 ? galeria : [""],
            };
        });
    };
    const isValidUrl = (value: string) => {
        try {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = "El nombre de la asociación es obligatorio.";
        }

        if (!formData.parroquia.trim()) {
            newErrors.parroquia = "La parroquia o comunidad es obligatoria.";
        }

        if (!formData.numero_familias) {
            newErrors.numero_familias =
                "Ingresa el número de familias socias.";
        } else if (Number(formData.numero_familias) < 1) {
            newErrors.numero_familias =
                "El número de familias debe ser mayor que 0.";
        }

        if (!formData.anio_fundacion) {
            newErrors.anio_fundacion =
                "El año de fundación es obligatorio.";
        } else {
            const year = Number(formData.anio_fundacion);
            const currentYear = new Date().getFullYear();

            if (year < 1900 || year > currentYear) {
                newErrors.anio_fundacion =
                    `El año debe estar entre 1900 y ${currentYear}.`;
            }
        }

        if (formData.foto_principal && !isValidUrl(formData.foto_principal)) {
            newErrors.foto_principal =
                "Ingresa una URL válida que comience con http:// o https://.";
        }

        if (formData.video_url && !isValidUrl(formData.video_url)) {
            newErrors.video_url =
                "Ingresa una URL válida de YouTube o Vimeo.";
        }

        if (!formData.lat) {
            newErrors.lat = "La latitud es obligatoria.";
        } else {
            const lat = Number(formData.lat);

            if (Number.isNaN(lat) || lat < -90 || lat > 90) {
                newErrors.lat =
                    "La latitud debe estar entre -90 y 90.";
            }
        }

        if (!formData.lng) {
            newErrors.lng = "La longitud es obligatoria.";
        } else {
            const lng = Number(formData.lng);

            if (Number.isNaN(lng) || lng < -180 || lng > 180) {
                newErrors.lng =
                    "La longitud debe estar entre -180 y 180.";
            }
        }

        if (!formData.referencia_vial.trim()) {
            newErrors.referencia_vial =
                "La referencia vial es obligatoria.";
        }

        if (!formData.historia.trim()) {
            newErrors.historia =
                "La historia y descripción es obligatoria.";
        }

        formData.galeria.forEach((url, index) => {
            if (url.trim() && !isValidUrl(url)) {
                newErrors.galeria =
                    `La URL de la imagen ${index + 1} no es válida.`;
            }
        });

        return newErrors;
    };
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationErrors = validateForm();

        setErrors(validationErrors);
        setStatus("idle");

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulación temporal del guardado.
            // Posteriormente se reemplazará por la llamada al backend/API.
            await new Promise((resolve) => setTimeout(resolve, 1200));

            setStatus("success");
        } catch {
            setStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* =====================================================
          DATOS GENERALES
      ====================================================== */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <span className="font-label text-xs font-semibold uppercase tracking-widest text-primary">
                        Sección 01
                    </span>

                    <h2 className="mt-1 font-headline text-2xl font-bold text-primary">
                        Datos generales
                    </h2>

                    <p className="mt-2 text-sm text-neutral-muted">
                        Información principal de la asociación.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                        <label
                            htmlFor="nombre"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Nombre de la asociación
                        </label>

                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            value={formData.nombre}
                            onChange={(event) =>
                                handleChange("nombre", event.target.value)
                            }
                            placeholder="Ej. Asociación San Pedro"
                            className={`w-full rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.nombre
                                ? "border-red-400 focus:border-red-500"
                                : "border-border focus:border-primary"
                                }`}
                            aria-invalid={Boolean(errors.nombre)}
                            aria-describedby={
                                errors.nombre ? "nombre-error" : undefined
                            }
                        />

                        {errors.nombre && (
                            <p
                                id="nombre-error"
                                role="alert"
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.nombre}
                            </p>
                        )}
                    </div>

                    {/* Parroquia */}
                    <div>
                        <label
                            htmlFor="parroquia"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Parroquia / Comunidad
                        </label>

                        <input
                            id="parroquia"
                            name="parroquia"
                            type="text"
                            value={formData.parroquia}
                            onChange={(event) =>
                                handleChange("parroquia", event.target.value)
                            }
                            placeholder="Ej. Pilahuín"
                            className={`w-full rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.parroquia
                                ? "border-red-400 focus:border-red-500"
                                : "border-border focus:border-primary"
                                }`}
                            aria-invalid={Boolean(errors.parroquia)}
                            aria-describedby={
                                errors.parroquia
                                    ? "parroquia-error"
                                    : undefined
                            }
                        />

                        {errors.parroquia && (
                            <p
                                id="parroquia-error"
                                role="alert"
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.parroquia}
                            </p>
                        )}
                    </div>

                    {/* Número de familias */}
                    <div>
                        <label
                            htmlFor="numero_familias"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Número de familias socias
                        </label>

                        <input
                            id="numero_familias"
                            name="numero_familias"
                            type="number"
                            min="1"
                            value={formData.numero_familias}
                            onChange={(event) =>
                                handleChange(
                                    "numero_familias",
                                    event.target.value
                                )
                            }
                            placeholder="Ej. 25"
                            className={`w-full rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.numero_familias
                                ? "border-red-400 focus:border-red-500"
                                : "border-border focus:border-primary"
                                }`}
                            aria-invalid={Boolean(errors.numero_familias)}
                            aria-describedby={
                                errors.numero_familias
                                    ? "numero-familias-error"
                                    : undefined
                            }
                        />

                        {errors.numero_familias && (
                            <p
                                id="numero-familias-error"
                                role="alert"
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.numero_familias}
                            </p>
                        )}
                    </div>

                    {/* Año de fundación */}
                    <div>
                        <label
                            htmlFor="anio_fundacion"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Año de fundación
                        </label>

                        <input
                            id="anio_fundacion"
                            name="anio_fundacion"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={formData.anio_fundacion}
                            onChange={(event) =>
                                handleChange(
                                    "anio_fundacion",
                                    event.target.value
                                )
                            }
                            placeholder="Ej. 2010"
                            className={`w-full rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.anio_fundacion
                                ? "border-red-400 focus:border-red-500"
                                : "border-border focus:border-primary"
                                }`}
                            aria-invalid={Boolean(errors.anio_fundacion)}
                            aria-describedby={
                                errors.anio_fundacion
                                    ? "anio-fundacion-error"
                                    : undefined
                            }
                        />

                        {errors.anio_fundacion && (
                            <p
                                id="anio-fundacion-error"
                                role="alert"
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.anio_fundacion}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* =====================================================
          CERTIFICACIÓN SANITARIA
      ====================================================== */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <span className="font-label text-xs font-semibold uppercase tracking-widest text-primary">
                        Sección 02
                    </span>

                    <h2 className="mt-1 font-headline text-2xl font-bold text-primary">
                        Certificación sanitaria
                    </h2>

                    <p className="mt-2 text-sm text-neutral-muted">
                        Datos relacionados con ARCSA y BPM.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {/* Registro ARCSA */}
                    <div>
                        <label
                            htmlFor="registro_arcsa"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Código de Registro ARCSA / BPM
                        </label>

                        <input
                            id="registro_arcsa"
                            name="registro_arcsa"
                            type="text"
                            value={formData.registro_arcsa}
                            onChange={(event) =>
                                handleChange(
                                    "registro_arcsa",
                                    event.target.value
                                )
                            }
                            placeholder="Código de registro"
                            className="w-full rounded-xl border border-border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:border-primary focus:ring-2 focus:ring-tertiary/30"
                        />
                    </div>

                    {/* Fecha de emisión */}
                    <div>
                        <label
                            htmlFor="fecha_emision"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Fecha de emisión
                        </label>

                        <input
                            id="fecha_emision"
                            name="fecha_emision"
                            type="date"
                            value={formData.fecha_emision}
                            onChange={(event) =>
                                handleChange(
                                    "fecha_emision",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border border-border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:border-primary focus:ring-2 focus:ring-tertiary/30"
                        />
                    </div>

                    {/* Estado */}
                    <div>
                        <label
                            htmlFor="estado_vigencia"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Estado de vigencia
                        </label>

                        <select
                            id="estado_vigencia"
                            name="estado_vigencia"
                            value={formData.estado_vigencia}
                            onChange={(event) =>
                                handleChange(
                                    "estado_vigencia",
                                    event.target.value
                                )
                            }
                            className="w-full rounded-xl border border-border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:border-primary focus:ring-2 focus:ring-tertiary/30"
                        >
                            <option value="">Seleccionar estado</option>
                            <option value="vigente">Vigente</option>
                            <option value="por_vencer">Por vencer</option>
                            <option value="vencido">Vencido</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* =====================================================
          MULTIMEDIA
      ====================================================== */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <span className="font-label text-xs font-semibold uppercase tracking-widest text-primary">
                        Sección 03
                    </span>

                    <h2 className="mt-1 font-headline text-2xl font-bold text-primary">
                        Multimedia
                    </h2>

                    <p className="mt-2 text-sm text-neutral-muted">
                        Agrega imágenes y un video para la presentación de la
                        asociación.
                    </p>
                </div>

                <div className="space-y-5">
                    {/* Foto principal */}
                    <div>
                        <label
                            htmlFor="foto_principal"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            URL de la foto principal
                        </label>

                        <input
                            id="foto_principal"
                            name="foto_principal"
                            type="url"
                            value={formData.foto_principal}
                            onChange={(event) =>
                                handleChange(
                                    "foto_principal",
                                    event.target.value
                                )
                            }
                            placeholder="https://ejemplo.com/foto.jpg"
                            className={`w-full rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.foto_principal
                                ? "border-red-400 focus:border-red-500"
                                : "border-border focus:border-primary"
                                }`}
                            aria-invalid={Boolean(errors.foto_principal)}
                            aria-describedby={
                                errors.foto_principal
                                    ? "foto-principal-error"
                                    : undefined
                            }
                        />

                        {errors.foto_principal && (
                            <p
                                id="foto-principal-error"
                                role="alert"
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.foto_principal}
                            </p>
                        )}
                    </div>

                    {/* Galería */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="block text-sm font-semibold text-neutral">
                                Galería de imágenes
                            </label>

                            <button
                                type="button"
                                onClick={addGalleryField}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                + Agregar imagen
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.galeria.map((url, index) => (
                                <div key={index}>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={url}
                                            onChange={(event) =>
                                                handleGalleryChange(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            aria-label={`URL de imagen ${index + 1
                                                }`}
                                            className={`min-w-0 flex-1 rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.galeria
                                                ? "border-red-400 focus:border-red-500"
                                                : "border-border focus:border-primary"
                                                }`}
                                            aria-invalid={Boolean(
                                                errors.galeria
                                            )}
                                            aria-describedby={
                                                errors.galeria
                                                    ? "galeria-error"
                                                    : undefined
                                            }
                                        />

                                        {formData.galeria.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeGalleryField(index)
                                                }
                                                className="rounded-xl border border-border px-4 text-sm font-semibold text-neutral-muted transition hover:border-red-300 hover:text-red-600"
                                                aria-label={`Eliminar imagen ${index + 1
                                                    }`}
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </div>

                                    {errors.galeria && index === 0 && (
                                        <p
                                            id="galeria-error"
                                            role="alert"
                                            className="mt-2 text-sm text-red-600"
                                        >
                                            {errors.galeria}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Video */}
                    <div>
                        <label
                            htmlFor="video_url"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Enlace de video YouTube / Vimeo
                        </label>

                        <input
                            id="video_url"
                            name="video_url"
                            type="url"
                            value={formData.video_url}
                            onChange={(event) =>
                                handleChange("video_url", event.target.value)
                            }
                            placeholder="https://www.youtube.com/..."
                            className={`w-full rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.video_url
                                ? "border-red-400 focus:border-red-500"
                                : "border-border focus:border-primary"
                                }`}
                            aria-invalid={Boolean(errors.video_url)}
                            aria-describedby={
                                errors.video_url ? "video-url-error" : undefined
                            }
                        />

                        {errors.video_url && (
                            <p
                                id="video-url-error"
                                role="alert"
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.video_url}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* =====================================================
          UBICACIÓN
      ====================================================== */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <span className="font-label text-xs font-semibold uppercase tracking-widest text-primary">
                        Sección 04
                    </span>

                    <h2 className="mt-1 font-headline text-2xl font-bold text-primary">
                        Ubicación
                    </h2>

                    <p className="mt-2 text-sm text-neutral-muted">
                        Coordenadas y referencia vial de la asociación.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    {/* Latitud */}
                    <div>
                        <label
                            htmlFor="lat"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Latitud
                        </label>

                        <input
                            id="lat"
                            name="lat"
                            type="number"
                            step="any"
                            value={formData.lat}
                            onChange={(event) =>
                                handleChange("lat", event.target.value)
                            }
                            placeholder="Ej. -1.2985"
                            className={`w-full rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.lat
                                ? "border-red-400 focus:border-red-500"
                                : "border-border focus:border-primary"
                                }`}
                            aria-invalid={Boolean(errors.lat)}
                            aria-describedby={
                                errors.lat ? "lat-error" : undefined
                            }
                        />

                        {errors.lat && (
                            <p
                                id="lat-error"
                                role="alert"
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.lat}
                            </p>
                        )}
                    </div>

                    {/* Longitud */}
                    <div>
                        <label
                            htmlFor="lng"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Longitud
                        </label>

                        <input
                            id="lng"
                            name="lng"
                            type="number"
                            step="any"
                            value={formData.lng}
                            onChange={(event) =>
                                handleChange("lng", event.target.value)
                            }
                            placeholder="Ej. -78.7123"
                            className={`w-full rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.lng
                                ? "border-red-400 focus:border-red-500"
                                : "border-border focus:border-primary"
                                }`}
                            aria-invalid={Boolean(errors.lng)}
                            aria-describedby={
                                errors.lng ? "lng-error" : undefined
                            }
                        />

                        {errors.lng && (
                            <p
                                id="lng-error"
                                role="alert"
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.lng}
                            </p>
                        )}
                    </div>

                    {/* Referencia vial */}
                    <div className="md:col-span-2">
                        <label
                            htmlFor="referencia_vial"
                            className="mb-2 block text-sm font-semibold text-neutral"
                        >
                            Referencia vial
                        </label>

                        <input
                            id="referencia_vial"
                            name="referencia_vial"
                            type="text"
                            value={formData.referencia_vial}
                            onChange={(event) =>
                                handleChange(
                                    "referencia_vial",
                                    event.target.value
                                )
                            }
                            placeholder="Ej. Vía Ambato--Guaranda"
                            className={`w-full rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.referencia_vial
                                ? "border-red-400 focus:border-red-500"
                                : "border-border focus:border-primary"
                                }`}
                            aria-invalid={Boolean(errors.referencia_vial)}
                            aria-describedby={
                                errors.referencia_vial
                                    ? "referencia-vial-error"
                                    : undefined
                            }
                        />

                        {errors.referencia_vial && (
                            <p
                                id="referencia-vial-error"
                                role="alert"
                                className="mt-2 text-sm text-red-600"
                            >
                                {errors.referencia_vial}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* =====================================================
          HISTORIA
      ====================================================== */}
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <span className="font-label text-xs font-semibold uppercase tracking-widest text-primary">
                        Sección 05
                    </span>

                    <h2 className="mt-1 font-headline text-2xl font-bold text-primary">
                        Historia y descripción
                    </h2>

                    <p className="mt-2 text-sm text-neutral-muted">
                        Describe la historia, actividades y características
                        principales de la asociación.
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="historia"
                        className="mb-2 block text-sm font-semibold text-neutral"
                    >
                        Historia y descripción
                    </label>

                    <textarea
                        id="historia"
                        name="historia"
                        rows={7}
                        maxLength={1000}
                        value={formData.historia}
                        onChange={(event) =>
                            handleChange("historia", event.target.value)
                        }
                        placeholder="Escribe aquí la historia y descripción de la asociación..."
                        className={`w-full resize-y rounded-xl border bg-[#F8F4E9]/40 px-4 py-3 text-sm text-neutral outline-none transition focus:ring-2 focus:ring-tertiary/30 ${errors.historia
                            ? "border-red-400 focus:border-red-500"
                            : "border-border focus:border-primary"
                            }`}
                        aria-invalid={Boolean(errors.historia)}
                        aria-describedby={
                            errors.historia ? "historia-error" : undefined
                        }
                    />

                    <div className="mt-2 flex items-center justify-between">
                        {errors.historia ? (
                            <p
                                id="historia-error"
                                role="alert"
                                className="text-sm text-red-600"
                            >
                                {errors.historia}
                            </p>
                        ) : (
                            <span />
                        )}

                        <span className="text-xs text-neutral-muted">
                            {formData.historia.length}/1000 caracteres
                        </span>
                    </div>
                </div>
            </section>

            {/* =====================================================
          ESTADOS
      ====================================================== */}
            {status === "success" && (
                <div
                    role="status"
                    aria-live="polite"
                    className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800"
                >
                    <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white"
                        aria-hidden="true"
                    >
                        ✓
                    </span>

                    <div>
                        <p className="font-semibold">
                            Asociación guardada correctamente
                        </p>

                        <p className="mt-1 text-green-700">
                            La información fue procesada correctamente.
                        </p>
                    </div>
                </div>
            )}

            {status === "error" && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800"
                >
                    <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                        aria-hidden="true"
                    >
                        !
                    </span>

                    <div>
                        <p className="font-semibold">
                            No se pudo guardar la asociación
                        </p>

                        <p className="mt-1 text-red-700">
                            Ocurrió un problema al procesar la información.
                            Inténtalo nuevamente.
                        </p>
                    </div>
                </div>
            )}

            {/* =====================================================
          ACCIONES
      ====================================================== */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() => {
                        setFormData(initialFormData);
                        setErrors({});
                        setStatus("idle");
                    }}
                    disabled={isSubmitting}
                    className="rounded-xl border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-inverted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Limpiar formulario
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-inverted shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting && (
                        <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                            aria-hidden="true"
                        />
                    )}

                    <span>
                        {isSubmitting ? "Guardando..." : "Guardar asociación"}
                    </span>
                </button>
            </div>
        </form>
    );
};