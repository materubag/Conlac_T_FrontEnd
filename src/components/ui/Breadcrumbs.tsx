import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-8 text-xs font-label text-neutral-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={`${item.href ?? "current"}-${index}`} className="flex min-w-0 max-w-full items-baseline gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {!isCurrent && item.href ? (
                <Link href={item.href} className="min-w-0 break-words rounded hover:text-primary focus-visible:ring-2 focus-visible:ring-tertiary">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isCurrent ? "page" : undefined} className="min-w-0 break-words font-semibold text-primary">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
