"use client";
import { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import { siteConfig } from "@/lib/config";
type Variant = { id?: string; sku: string; presentation_name: string; weight_grams: string; price: string; stock: string; version?: number; is_active: boolean };
const newVariant = ():Variant=>({sku:`Q-${Date.now()}`,presentation_name:"500 g",weight_grams:"500",price:"",stock:"",is_active:true});
export function ProductModal({productId,onClose,onSaved}:{productId:string|null;onClose:()=>void;onSaved:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null); const [name,setName]=useState("");const [type,setType]=useState(""); const [association,setAssociation]=useState("");const [category,setCategory]=useState<string|null>(null);
 const [description,setDescription]=useState("");const [short,setShort]=useState("");const [origin,setOrigin]=useState("");const [conservation,setConservation]=useState("");const [featured,setFeatured]=useState(false);
 const [status,setStatus]=useState("published");const [photo,setPhoto]=useState("");const [variants,setVariants]=useState<Variant[]>([newVariant()]); const [associations,setAssociations]=useState<{id:string;nombre:string}[]>([]);
 const [busy,setBusy]=useState(true);const [error,setError]=useState("");
 const [removedVariantIds,setRemovedVariantIds]=useState<string[]>([]);
 const [photoPreview,setPhotoPreview]=useState("");
 const [uploadMessage,setUploadMessage]=useState("");
 useEffect(()=>{dialog.current?.showModal(); let active=true; (async()=>{try {
   const res=await fetch(`${siteConfig.backendUrl}/asociaciones`);if(!res.ok)throw new Error("No se pudieron cargar las asociaciones");const list=await res.json();if(active)setAssociations(list);
   if(productId){const res=await adminFetch(`${siteConfig.backendUrl}/admin/productos/${productId}`);if(!res.ok)throw new Error("No se pudo cargar el producto");const p=await res.json();if(active){setName(p.nombre);setType(p.tipo_queso||"");setAssociation(p.asociacion_id||"");setCategory(p.categoria_id);setStatus(p.status);setPhoto(p.fotos[0]||"");setDescription(p.descripcion||"");setShort(p.descripcion_corta||"");setOrigin(p.origen||"");setConservation(p.conservacion||"");setFeatured(p.is_featured);setVariants(p.presentaciones.filter((v:{is_active:boolean})=>v.is_active!==false).map((v:{id:string;sku:string;nombre_presentacion:string;peso_gramos:number;precio:number;stock:number;version:number;is_active:boolean})=>({id:v.id,sku:v.sku,presentation_name:v.nombre_presentacion,weight_grams:String(v.peso_gramos ?? ""),price:String(v.precio ?? ""),stock:String(v.stock ?? ""),version:v.version,is_active:v.is_active})));}}
 }catch(e){if(active)setError(e instanceof Error?e.message:"Error");}finally{if(active)setBusy(false);}})();return()=>{active=false;};},[productId]);
 function change(i:number,key:keyof Variant,value:string|boolean){setVariants(v=>v.map((r,n)=>n===i?{...r,[key]:value}:r));}
 function removeVariant(index:number){
   if(busy || variants.length<=1)return;
   const removed=variants[index];
   if(removed.id)setRemovedVariantIds(ids=>[...ids,removed.id!]);
   setVariants(current=>current.filter((_,i)=>i!==index));
 }
 async function upload(file:File){
   setError("");setUploadMessage("");
   if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setError("Selecciona una foto JPEG, PNG o WebP.");return;}
   if(file.size===0 || file.size>5*1024*1024){setError("La foto debe pesar entre 1 byte y 5 MB.");return;}
   setBusy(true);
   try{
     const body=new FormData();body.set("file",file);
     const res=await adminFetch(`${siteConfig.backendUrl}/admin/imagenes`,{method:"POST",body});
     const data=await res.json().catch(()=>null);
     if(!res.ok)throw new Error(res.status===401?"Tu sesión caducó. Inicia sesión nuevamente para subir la foto.":data?.message || "No se pudo subir la foto. Intenta nuevamente.");
     setPhoto(data.storage_path);setPhotoPreview(data.url);setUploadMessage("Foto subida correctamente. Guarda el producto para aplicar el cambio.");
   }catch(e){setError(e instanceof Error?e.message:"No se pudo subir la foto");}finally{setBusy(false);}
 }
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const res=await adminFetch(`${siteConfig.backendUrl}/admin/catalogo`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:productId,producto:{nombre:name,tipo_queso:type,asociacion_id:association||null,categoria_id:category,descripcion:description,descripcion_corta:short,origen:origin,conservacion:conservation,is_featured:featured,status},variantes:variants.map(v=>({...v,weight_grams:Number(v.weight_grams),price:Number(v.price),stock:Number(v.stock)})),foto:photo,eliminadas:removedVariantIds})});if(!res.ok){const data=await res.json();throw new Error(data.message||"No se pudo guardar el producto. Recarga si el inventario cambió.");}onSaved();}catch(e){setError(e instanceof Error?e.message:"Error");}finally{setBusy(false);}}
 const inputClass="border rounded-lg p-2 w-full";
 return <dialog ref={dialog} onCancel={event=>{if(event.target!==event.currentTarget)return;event.preventDefault();onClose();}} className="fixed inset-0 m-auto w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface p-6 backdrop:bg-black/50" aria-labelledby="product-title"><form onSubmit={save} className="space-y-4">
 <div className="flex justify-between gap-4"><h2 id="product-title" className="text-2xl font-bold">{productId?"Editar producto":"Nuevo producto"}</h2><button type="button" onClick={onClose} aria-label="Cerrar">✕</button></div>
 {error&&<p role="alert" className="text-red-700">{error}</p>}
 <label className="block">Nombre<input required maxLength={150} className={inputClass} value={name} onChange={e=>setName(e.target.value)}/></label>
 <label className="block">Tipo de queso<input className={inputClass} value={type} onChange={e=>setType(e.target.value)}/></label>
 <label className="block">Asociación<select className={inputClass} value={association} onChange={e=>setAssociation(e.target.value)}><option value="">Consorcio</option>{associations.map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}</select></label>
 <label className="block">Descripción<textarea className={inputClass} value={description} onChange={e=>setDescription(e.target.value)}/></label>
 <div className="space-y-2">
   <label htmlFor="product-photo-file" className="block">Foto del producto (JPEG, PNG o WebP, hasta 5 MB)</label>
   <input id="product-photo-file" type="file" disabled={busy} accept="image/jpeg,image/png,image/webp"
     onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value="";if(file)void upload(file);}}/>
   {uploadMessage&&<p role="status" className="text-green-800">{uploadMessage}</p>}
   <label htmlFor="product-photo-url" className="block">Enlace de la foto (opcional)</label>
   <input id="product-photo-url" className={inputClass} value={photo} onChange={e=>{setPhoto(e.target.value);setPhotoPreview("");setUploadMessage("");}}/>
   {(photoPreview || photo.startsWith("https://") || photo.startsWith("/"))&&
     // Native image supports the preview URL returned by the upload service.
     // eslint-disable-next-line @next/next/no-img-element
     <img src={photoPreview || photo} alt="Vista previa de la foto del producto" className="h-40 w-40 rounded-lg object-cover"/>}
 </div>
 <label className="block">Publicación<select className={inputClass} value={status} onChange={e=>setStatus(e.target.value)}><option value="published">Publicado</option><option value="draft">Borrador</option><option value="hidden">Oculto</option></select></label>
 <p className="text-sm text-neutral-muted">Puedes eliminar presentaciones al guardar. Debe quedar al menos una.</p>
 <h3 className="font-bold">Presentaciones, precios e inventario</h3>
 {variants.map((v,i)=><fieldset key={i} className="border rounded-xl p-3 grid grid-cols-2 gap-3"><legend>Presentación {i+1}</legend>
 <div className="col-span-2 flex justify-end"><button type="button" disabled={busy || variants.length<=1} onClick={()=>removeVariant(i)} aria-label={`Eliminar presentación ${i+1}`} title={variants.length<=1?"Debe quedar al menos una presentación":"Se eliminará al guardar el producto"} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 hover:border-red-400 disabled:opacity-40 disabled:cursor-not-allowed">Eliminar presentación</button></div>
 <label>SKU<input required className={inputClass} value={v.sku} onChange={e=>change(i,"sku",e.target.value)}/></label><label>Nombre<input required className={inputClass} value={v.presentation_name} onChange={e=>change(i,"presentation_name",e.target.value)}/></label>
 <label>Peso (g)<input required type="number" min="1" className={inputClass} value={v.weight_grams} onChange={e=>change(i,"weight_grams",e.target.value)}/></label>
 <label>Precio ($)<input required type="number" min="0" step="0.01" placeholder="Ej. 3.50" className={inputClass} value={v.price} onChange={e=>change(i,"price",e.target.value)}/></label>
 <label>Stock<input required type="number" min="0" step="1" placeholder="Ej. 10" className={inputClass} value={v.stock} onChange={e=>change(i,"stock",e.target.value)}/></label><label><input type="checkbox" checked={v.is_active} onChange={e=>change(i,"is_active",e.target.checked)}/> Activa</label></fieldset>)}
 <button type="button" onClick={()=>setVariants([...variants,newVariant()])} className="border rounded p-2">Añadir presentación</button>
 <div className="flex gap-4"><button disabled={busy} className="rounded bg-primary text-white px-6 py-3 disabled:opacity-50">{busy?"Procesando…":"Guardar producto"}</button><button type="button" onClick={onClose}>Cancelar</button></div>
 </form></dialog>;
}
