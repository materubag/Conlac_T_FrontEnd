import { backendProxy } from "@/lib/backendProxy";
export async function GET(request: Request) { return backendProxy(request, "/admin/secciones"); }
export async function POST(request: Request) { return backendProxy(request, "/admin/secciones", "POST", await request.json()); }
