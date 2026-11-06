"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { siteConfig } from "@/lib/config";
import { normalizeBackendProduct } from "@/lib/data";
import { adminFetch, mensajeDeError } from "@/lib/adminFetch";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/home/ProductCard";
import { ProductModal } from "@/components/tienda/ProductModal";
import { EditableField } from "@/components/admin/EditableField";
import type { PaginaEditableConfig } from "@/lib/db/paginasRepo";
import type { Producto, Asociacion } from "@/types";
export interface TiendaContenido { productos?: Producto[] }
interface Props { initialConfig: PaginaEditableConfig<TiendaContenido>; products: Producto[]; asociacion: Asociacion | null; error: string | null }
export function TiendaManager({initialConfig,products,asociacion,error}: Props) {
  const {isAdmin} = useAuth(); const router = useRouter();
  const [search,setSearch]=useState(""); const [type,setType]=useState(""); const [association,setAssociation]=useState(asociacion?.nombre || ""); const [weight,setWeight]=useState("");
  const [editing,setEditing]=useState<string | null | undefined>(undefined); const [message,setMessage]=useState(""); const [config,setConfig]=useState(initialConfig);
  const [adminProducts,setAdminProducts]=useState<Producto[]|null>(null);
  useEffect(()=>{if(!isAdmin)return;let active=true;adminFetch(`${siteConfig.backendUrl}/admin/productos`).then(async response=>{
    if(!response.ok)throw new Error("No se pudo cargar el catálogo administrativo");
    const list: Producto[]=await response.json();if(active)setAdminProducts(list.map(normalizeBackendProduct));
  }).catch(e=>{if(active)setMessage(e.message);});return()=>{active=false;};},[isAdmin,products]);
  const catalog=isAdmin&&adminProducts?adminProducts:products;
  const filtered=useMemo(()=>catalog.filter(p=>(!search || `${p.nombre} ${p.tipo_queso} ${p.asociacion}`.toLowerCase().includes(search.toLowerCase())) && (!type || p.tipo_queso===type) && (!association || p.asociacion===association) && (!weight || p.peso===weight)),[catalog,search,type,association,weight]);
  async function hide(id:string) { if(!confirm("¿Ocultar este producto del catálogo?")) return;
    try {const r=await adminFetch(`${siteConfig.backendUrl}/admin/productos/${id}`,{method:"DELETE"}); if(!r.ok) throw new Error("No se pudo ocultar"); router.refresh();}catch(e){setMessage(e instanceof Error?e.message:"Error");} }
  async function saveHeader(){ try{const r=await adminFetch("/api/admin/paginas/tienda",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...config,contenido:{}})}); if(!r.ok)throw new Error(await mensajeDeError(r,"No se pudo guardar"));setMessage("Encabezado guardado");}catch(e){setMessage(e instanceof Error?e.message:"Error");}}
  return <Container className="py-12">
    <EditableField isEditing={isAdmin} value={config.eyebrow} onChange={v=>setConfig({...config,eyebrow:v})} className="text-tertiary" />
    <h1 className="text-3xl font-bold my-3"><EditableField isEditing={isAdmin} value={asociacion?`Quesos de ${asociacion.nombre}`:config.titulo} onChange={v=>setConfig({...config,titulo:v})}/></h1>
    <EditableField isEditing={isAdmin} value={config.subtitulo} onChange={v=>setConfig({...config,subtitulo:v})}/>
    {isAdmin && <div className="flex gap-3 my-4"><button onClick={()=>setEditing(null)} className="rounded bg-primary text-white px-5 py-3">Añadir producto</button><button onClick={saveHeader} className="border rounded px-4">Guardar encabezado</button></div>}
    {message && <p role="status">{message}</p>}{error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="flex flex-wrap gap-3 my-8"><input aria-label="Buscar productos" placeholder="Buscar quesos…" value={search} onChange={e=>setSearch(e.target.value)} className="border rounded-lg p-3"/>
      {([{value:type,set:setType,key:"tipo_queso",label:"Tipo de queso"},{value:association,set:setAssociation,key:"asociacion",label:"Asociación"},{value:weight,set:setWeight,key:"peso",label:"Peso"}] as const).map(filter=><select key={filter.key} aria-label={filter.label} value={filter.value} onChange={e=>filter.set(e.target.value)} className="border rounded-lg p-3"><option value="">{filter.label}: todos</option>{[...new Set(catalog.map(p=>p[filter.key]).filter(Boolean))].map(v=><option key={v} value={v}>{v}</option>)}</select>)}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(p=><div key={p.id}><ProductCard product={p}/>{isAdmin&&<div className="flex gap-3 mt-2"><button onClick={()=>setEditing(p.id)} className="border rounded px-4 py-2">Editar producto</button><button onClick={()=>hide(p.id)} className="border rounded px-4 py-2">Ocultar</button></div>}</div>)}</div>
    {!filtered.length && !error && <p>No hay productos con estos filtros.</p>}
    {editing!==undefined && <ProductModal productId={editing} onClose={()=>setEditing(undefined)} onSaved={()=>{setEditing(undefined);router.refresh();}}/>}
  </Container>;
}
