/* A vitrine usa sempre leitura anônima, mesmo no navegador da administradora. */
(() => {
const A=window.CelinaAPI, demo=window.PRODUCTS;
function adapt(row,categories){
 const variants=(row.product_variants||[]).sort((a,b)=>a.sort_order-b.sort_order);
 const colors=[...new Map(variants.map(v=>[v.color_name,{name:v.color_name,hex:/^#[0-9a-f]{6}$/i.test(v.color_hex||'')?v.color_hex:'#0d6172'}])).values()];
 const sizes=[...new Set(variants.map(v=>v.size))];
 const images=(row.product_images||[]).sort((a,b)=>a.sort_order-b.sort_order).map(i=>A.publicImage(i.storage_path));
 return {id:row.id,name:row.name,category:categories.find(c=>c.id===row.category_id)?.name||'Outras peças',price:Number(row.price),active:row.status==='published',new:row.is_new,description:row.description,care:row.care,colors,sizes,variants,unavailableSizes:sizes.filter(s=>!variants.some(v=>v.size===s&&v.available)),soldOut:!variants.some(v=>v.available),image:images[0]||'assets/images/placeholder.svg',images};
}
let inFlight;
window.CelinaCatalog={
 available(p,size,color){return !!p?.variants?.some(v=>v.size===size&&v.color_name===color&&v.available);},
 async refresh(){
  if(A.config.demoMode){window.PRODUCTS=demo.map(p=>({...p,variants:p.colors.flatMap(c=>p.sizes.map(s=>({color_name:c.name,color_hex:c.hex,size:s,available:!(p.unavailableSizes||[]).includes(s)}))),soldOut:false}));return;}
  if(inFlight)return inFlight;
  inFlight=(async()=>{
   const [cats,rows]=await Promise.all([
    A.allRows('categories',{select:'id,name,slug,active,sort_order',active:'eq.true',order:'sort_order.asc,id.asc'}),
    A.allRows('products',{select:'*,product_variants(*),product_images(*)',status:'eq.published',order:'sort_order.asc,created_at.desc,id.asc'})
   ]);
   const products=rows.filter(p=>p.status==='published'&&(!p.category_id||cats.some(c=>c.id===p.category_id))).map(p=>adapt(p,cats));
   window.STORE_CONFIG.categories=cats.map(c=>c.name);
   if(products.some(p=>p.category==='Outras peças'))window.STORE_CONFIG.categories.push('Outras peças');
   window.PRODUCTS=products;window.CATALOG_CATEGORIES=cats;
  })().finally(()=>inFlight=null);
  return inFlight;
 }
};
})();
