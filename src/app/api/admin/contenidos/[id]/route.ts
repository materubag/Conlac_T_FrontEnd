import { backendProxy } from "@/lib/backendProxy";
type Context = {params: Promise<{id:string}>};
export async function PATCH(request: Request, {params}: Context) { return backendProxy(request, `/admin/contenidos/${encodeURIComponent((await params).id)}`, "PATCH", await request.json()); }
export async function DELETE(request: Request, {params}: Context) { return backendProxy(request, `/admin/contenidos/${encodeURIComponent((await params).id)}`, "DELETE"); }
