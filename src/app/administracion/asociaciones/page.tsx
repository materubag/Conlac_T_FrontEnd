import React from "react";
import { AssociationAdminForm } from "@/components/associations/AssociationAdminForm";

export default function AdministracionAsociacionesPage() {
  return (
    <main className="min-h-screen bg-[#F8F4E9]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="font-label text-sm font-semibold uppercase tracking-widest text-primary">
            Administración
          </span>

          <h1 className="mt-2 font-headline text-3xl font-bold text-primary sm:text-4xl">
            Administración de Asociaciones
          </h1>

          <p className="mt-3 max-w-2xl text-neutral-muted">
            Registra y administra la información de las asociaciones que
            forman parte de CONLAC-T.
          </p>
        </div>

        <AssociationAdminForm />
      </div>
    </main>
  );
}