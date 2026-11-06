"use client";
export default function ErrorPage({reset}:{reset:()=>void}) {
 return <main className="max-w-xl mx-auto py-16 px-6 space-y-4"><h1 className="text-2xl font-bold">No pudimos cargar esta página</h1><p>El servicio de contenidos no está disponible temporalmente. Intenta nuevamente en unos minutos.</p><button onClick={reset} className="rounded bg-primary text-white px-5 py-3">Volver a intentar</button></main>;
}
