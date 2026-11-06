import { backendProxy } from "@/lib/backendProxy";
export async function GET(request: Request) { return backendProxy(request, "/admin/contenidos"); }
export async function POST(request: Request) { return backendProxy(request, "/admin/contenidos", "POST", await request.json()); }
