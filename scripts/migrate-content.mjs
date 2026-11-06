// Run with Node 24+ after applying the PostgreSQL migration. Original SQLite is opened read-only.
import { DatabaseSync } from "node:sqlite";
const file=process.argv[2];
if(!file || !process.env.CONLACT_ADMIN_TOKEN) throw new Error("Uso: CONLACT_ADMIN_TOKEN configurado y node scripts/migrate-content.mjs ruta/contenidos.db");
const base=process.env.BACKEND_API_URL || "http://localhost:8080/api";
const db=new DatabaseSync(file,{readOnly:true});
async function api(path,body,method="POST") {
 const response=await fetch(base+path,{method,headers:{Authorization:`Bearer ${process.env.CONLACT_ADMIN_TOKEN}`,"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)});
 if(!response.ok)throw new Error(`No se pudo migrar ${path}: HTTP ${response.status}`);
 return response.status===204?null:response.json();
}
const tables=new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t=>t.name));
try {
 if(tables.has("paginas_editables")) for(const page of db.prepare("SELECT * FROM paginas_editables").all()) {
  const content=JSON.parse(page.contenido_json || "{}");
  if(page.slug==="tienda" && Array.isArray(content.productos)) {
   for(const p of content.productos) {
    // Resolve by slug, making reruns safe for previously imported products.
    const res=await fetch(`${base}/products/${encodeURIComponent(p.slug || p.id)}`);
    if(!res.ok && res.status!==404)throw new Error("Catálogo no disponible");
    if(res.ok)continue;
    const weight=parseInt(p.peso,10)||500;
    await api("/admin/catalogo",{producto:{nombre:p.nombre,slug:p.slug,tipo_queso:p.tipo_queso,status:"published"},
     variantes:[{sku:`MIG-${p.slug || p.id}`.slice(0,50),presentation_name:p.peso || `${weight} g`,weight_grams:weight,price:p.precio,stock:p.stock||0,is_active:true}],foto:p.fotos?.[0]});
   }
   delete content.productos;
  }
  await api(`/admin/paginas/${encodeURIComponent(page.slug)}`,{eyebrow:page.eyebrow||"",titulo:page.titulo||"",subtitulo:page.subtitulo||"",contenido:content});
 }
 if(tables.has("recetas_editables")) {
  const existing=await api("/admin/recetas",undefined,"GET");
  const recipes=db.prepare("SELECT * FROM recetas_editables ORDER BY orden").all().map(r=>({
   ...r,id:existing.find(saved=>saved.slug===r.slug)?.id || r.id,
   pasos:JSON.parse(r.pasos_json).map(p=>typeof p==="string"?p:p.instruction),publicado:!!r.publicado,
  }));
  await api("/admin/recetas/sync",{recetas:recipes,eliminadas:[]});
 }
 if(tables.has("secciones") && tables.has("contenidos")) {
  const items=db.prepare("SELECT * FROM contenidos ORDER BY orden").all();
  const sections=db.prepare("SELECT * FROM secciones ORDER BY orden").all().map(s=>({...s,publicado:!!s.publicado,contenidos:items.filter(i=>i.seccion_id===s.id).map(i=>({...i,publicado:!!i.publicado}))}));
  await api("/admin/paginas/capacitacion",{eyebrow:"",titulo:"Capacitación",subtitulo:"",contenido:{secciones:sections}});
 }
 console.log("Migración finalizada. El archivo SQLite original no se modificó.");
}finally{db.close();}
