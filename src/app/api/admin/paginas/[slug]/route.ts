import { backendProxy } from "@/lib/backendProxy";
type Context = { params: Promise<{ slug: string }> };
export async function GET(request: Request, { params }: Context) {
  return backendProxy(request, `/paginas/${encodeURIComponent((await params).slug)}`);
}
export async function POST(request: Request, { params }: Context) {
  const response = await backendProxy(request, `/admin/paginas/${encodeURIComponent((await params).slug)}`, "POST", await request.json());
  if (!response.ok) return response;
  return Response.json({ ok: true, data: await response.json() });
}
