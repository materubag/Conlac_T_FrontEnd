import { siteConfig } from "@/lib/config";
import type { SeccionConContenidos } from "@/types/contenido";
export async function listarSecciones(): Promise<SeccionConContenidos[]> {
 const response=await fetch(`${siteConfig.backendUrl}/capacitacion`,{cache:"no-store"});
 if(!response.ok)throw new Error("No se pudieron cargar los materiales");return response.json();
}
