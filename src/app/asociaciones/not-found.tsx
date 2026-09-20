import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AssociationNotFound() {
  return (
    <div className="bg-background py-12 sm:py-16">
      <Container>
        <Breadcrumbs items={[
          { label: "Inicio", href: "/" },
          { label: "Asociaciones", href: "/asociaciones" },
          { label: "Asociación no encontrada" },
        ]} />
        <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-surface p-6 text-center sm:p-10">
          <p className="font-label text-sm font-semibold text-neutral-muted">Error 404</p>
          <h1 className="font-headline text-3xl font-bold text-primary">Asociación no encontrada</h1>
          <p className="text-neutral-muted">No encontramos esta asociación. Consulta el listado para conocer nuestras comunidades productoras.</p>
          <Button href="/asociaciones" variant="primary">
            <span className="text-inverted">Volver a asociaciones</span>
          </Button>
        </div>
      </Container>
    </div>
  );
}
