import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  ChefHatIcon,
  MountainIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Nosotros | Consorcio CONLAC-T",
  description: "Historia, valores y misión del Consorcio de Lácteos de Tungurahua (CONLAC-T).",
};

export default function NosotrosPage() {
  return (
    <main className="bg-background pb-16 sm:pb-24">
      <Container className="space-y-16 sm:space-y-24">
        <section className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-16 text-inverted shadow-artisan sm:px-12 sm:py-24 lg:px-20">
          <Image
            src="/images/hero-andes.svg"
            alt="Paisaje andino de Tungurahua"
            fill
            priority
            className="-z-20 object-cover opacity-35"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/25" />
          <div className="max-w-3xl">
            <Badge variant="tertiary">Herencia y territorio andino</Badge>
            <h1 className="mt-5 text-4xl leading-tight !text-inverted sm:text-6xl">
              Nuestra historia y tradición
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-inverted/85 sm:text-lg">
              La unión viva de más de 450 familias campesinas e indígenas en las faldas del
              volcán Tungurahua, preservando la pureza del ordeño artesanal y el pastoreo libre.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#historia" variant="inverted" className="!text-primary">
                Conocer nuestra raíz <ArrowRightIcon />
              </Button>
              <Button href="#impacto" variant="outlined" className="!border-white !text-white hover:bg-inverted hover:!text-primary">
                Impacto en cifras
              </Button>
            </div>
          </div>
        </section>

        <section id="historia" className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-warm shadow-artisan">
              <Image
                src="/images/hero-andes.svg"
                alt="Paisaje de las comunidades productoras de Tungurahua"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-3 max-w-[15rem] rounded-2xl bg-surface p-5 shadow-artisan sm:right-5">
              <div className="flex items-center gap-3">
                <MountainIcon className="h-8 w-8 shrink-0 text-primary" />
                <div>
                  <p className="font-label text-sm font-bold text-primary">Leche de altura</p>
                  <p className="text-xs leading-relaxed text-neutral-muted">Pastoreo libre a más de 3.000 msnm</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Génesis del consorcio</p>
            <h2 className="mt-3 text-3xl sm:text-4xl">Unidos por el bienestar de nuestras familias y la pureza láctea</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-neutral-muted">
              <p>
                El <strong className="text-neutral">Consorcio de Lácteos de Tungurahua (CONLAC-T)</strong> nació de un anhelo compartido entre pequeños productores andinos: transformar la leche cruda de sus fincas en quesos y derivados de categoría nacional, superando la intermediación desleal y asegurando un precio justo para el productor rural.
              </p>
              <p>
                Desde las comunidades de Pilahuín, Quero, Píllaro, Mocha y Patate, reunimos asociaciones de base. Cada amanecer, nuestras socias y socios cosechan leche fresca, fruto de pastos nativos hidratados por vertientes volcánicas.
              </p>
              <p className="border-l-4 border-tertiary bg-surface-warm p-4 text-primary">
                “No vendemos simplemente queso o yogur; entregamos el sustento honesto de cientos de hogares que custodian el agua, el suelo y la herencia de Tungurahua.”
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Comercio justo", "Pago puntual y digno"],
                ["Producción sostenible", "Cuidado de páramos"],
                ["Saber artesanal", "Recetas con identidad"],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl bg-surface p-4 shadow-artisan">
                  <SparklesIcon className="mb-2 h-5 w-5 text-tertiary" />
                  <p className="font-label text-sm font-bold text-primary">{title}</p>
                  <p className="mt-1 text-xs text-neutral-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-surface-warm px-6 py-12 shadow-artisan sm:px-10 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Nuestros pilares</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Misión, visión y valores</h2>
            <p className="mt-3 leading-relaxed text-neutral-muted">La brújula comunitaria que rige cada decisión productiva, humana y comercial.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-surface p-7 shadow-artisan">
              <UsersIcon className="mb-5 h-9 w-9 text-primary" />
              <h3 className="text-2xl">Misión institucional</h3>
              <p className="mt-3 leading-relaxed text-neutral-muted">Impulsar el desarrollo socioeconómico y sostenible de las familias campesinas de Tungurahua mediante la transformación de leche de páramo en productos lácteos artesanales de alta inocuidad, garantizando comercio equitativo y dignificación agraria.</p>
            </div>
            <div className="rounded-2xl bg-surface p-7 shadow-artisan">
              <MountainIcon className="mb-5 h-9 w-9 text-tertiary" />
              <h3 className="text-2xl">Visión al 2030</h3>
              <p className="mt-3 leading-relaxed text-neutral-muted">Ser el consorcio cooperativo referente del Ecuador y la región andina en ganadería sostenible de altura, con trazabilidad intachable y excelencia gastronómica.</p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Comercio justo", "Remuneración transparente que apoya la economía familiar."],
              ["Pureza y calidad", "Lácteos naturales con estricto control sanitario."],
              ["Pachamama", "Respeto al agua, los suelos y el bienestar animal."],
              ["Trabajo comunitario", "La fuerza de la minga aplicada a la gestión cooperativa."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl bg-surface p-5 text-center shadow-artisan">
                <ShieldCheckIcon className="mx-auto mb-3 h-8 w-8 text-primary" />
                <h3 className="font-label text-sm font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="impacto">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Cifras que inspiran</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">Impacto social y comunitario</h2>
            </div>
            <p className="max-w-md leading-relaxed text-neutral-muted">Resultados tangibles de un modelo asociativo que genera arraigo rural y nutrición genuina en el Ecuador.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["+450", "Familias productoras", "Ingresos estables y capacitación técnica continua."],
              ["12", "Asociaciones lecheras", "Centros de acopio distribuidos en Tungurahua."],
              ["100%", "Leche de altura", "Pastoreo en pastizales naturales de páramo."],
              ["25+", "Años de tradición", "Saber artesanal transmitido entre generaciones."],
            ].map(([value, title, description]) => (
              <div key={title} className="rounded-2xl bg-primary p-6 text-inverted shadow-artisan transition-colors hover:bg-primary-hover">
                <p className="font-headline text-4xl font-bold !text-inverted">{value}</p>
                <h3 className="mt-3 !text-inverted text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed !text-inverted/80">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="calidad" className="rounded-3xl bg-surface-warm px-6 py-10 shadow-artisan sm:px-10 sm:py-14">
          <div className="max-w-3xl">
            <p className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Inocuidad y confianza</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Garantías que acompañan cada producto</h2>
            <p className="mt-3 leading-relaxed text-neutral-muted">Nuestros procesos de ordeño, recolección, transformación y maduración se construyen con asesoría técnica y estándares sanitarios para proteger a nuestras familias productoras y consumidoras.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["ARCSA", "Notificación sanitaria", "Control vigente para nuestra línea de quesos y yogures."],
              ["Agrocalidad", "Hato libre y sano", "Monitoreo veterinario constante en las fincas asociadas."],
              ["Norma BPG", "Buenas prácticas", "Bienestar animal, higiene de ordeño y cuidado del agua."],
              ["Sello provincial", "Marca Tungurahua", "Reconocimiento al valor productivo y cultural local."],
            ].map(([label, title, description]) => (
              <div key={label} className="rounded-2xl bg-surface p-5 shadow-artisan">
                <Badge variant="tertiary">{label}</Badge>
                <h3 className="mt-4 text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-primary px-6 py-10 text-inverted shadow-artisan sm:px-12 sm:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-tertiary-light">Súmate a nuestra cadena de valor</p>
              <h2 className="mt-3 text-3xl !text-inverted sm:text-4xl">Descubre el sabor auténtico de Tungurahua</h2>
              <p className="mt-4 leading-relaxed text-inverted/80">Conoce nuestros productos artesanales o intégralos en la cocina de tu restaurante. Estamos listos para atenderte con calidez andina.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/tienda" variant="inverted" className="!text-primary">Conoce nuestros productos</Button>
              <Button href="/contacto" variant="outlined" className="!border-white !text-white hover:bg-inverted hover:!text-primary">Contáctanos</Button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="font-label text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Voces de nuestra comunidad</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">Testimonios de quienes nos eligen</h2>
            </div>
            <ChefHatIcon className="hidden h-12 w-12 text-tertiary sm:block" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["“La cremosidad y el punto de sal del queso de CONLAC-T elevaron los platos tradicionales de nuestra carta.”", "Chef Mateo Villacís", "Restaurante Altura & Raíz, Baños"],
              ["“La frescura es incomparable. Saber que apoyamos directamente a campesinos de nuestra provincia nos da paz.”", "Carmen Salazar Morales", "Clienta habitual, Ambato"],
              ["“La puntualidad de entrega y el compromiso ético los convierten en un socio insustituible.”", "Diego Barreno", "Café Páramo & Aroma, Pelileo"],
            ].map(([quote, name, role]) => (
              <figure key={name} className="flex flex-col justify-between rounded-2xl bg-surface p-6 shadow-artisan">
                <blockquote className="leading-relaxed text-neutral-muted italic">{quote}</blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <p className="font-label text-sm font-bold text-primary">{name}</p>
                  <p className="mt-1 text-xs text-neutral-muted">{role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
