import { Container } from "@/components/ui/Container";

export default function AssociationsLoading() {
  return (
    <div className="bg-background py-12 sm:py-16">
      <Container>
        <h1 className="sr-only">Asociaciones</h1>
        <p role="status" className="mb-8 text-sm text-neutral-muted">Cargando asociaciones…</p>
        <div aria-hidden="true" className="space-y-8 motion-safe:animate-pulse">
          <div className="h-10 w-3/4 max-w-lg rounded bg-neutral-light" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="space-y-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <div className="aspect-video rounded-xl bg-neutral-light" />
                <div className="h-8 w-3/4 rounded bg-neutral-light" />
                <div className="h-4 rounded bg-neutral-light" />
                <div className="h-4 w-5/6 rounded bg-neutral-light" />
                <div className="h-10 w-28 rounded-xl bg-neutral-light" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
