import { Container } from "@/components/ui/Container";

export default function AssociationLoading() {
  return (
    <div className="bg-background py-12 sm:py-16">
      <Container>
        <h1 className="sr-only">Perfil de asociación</h1>
        <p role="status" className="mb-8 text-sm text-neutral-muted">Cargando asociación…</p>
        <div aria-hidden="true" className="space-y-8 rounded-2xl border border-border bg-surface p-6 motion-safe:animate-pulse sm:p-10">
          <div className="aspect-[21/9] rounded-xl bg-neutral-light" />
          <div className="h-10 w-3/4 rounded bg-neutral-light" />
          <div className="space-y-3">
            <div className="h-4 rounded bg-neutral-light" />
            <div className="h-4 w-5/6 rounded bg-neutral-light" />
            <div className="h-4 w-2/3 rounded bg-neutral-light" />
          </div>
          <div className="h-64 rounded-xl bg-neutral-light sm:h-80" />
        </div>
      </Container>
    </div>
  );
}
