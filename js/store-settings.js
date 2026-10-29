/* Configurações públicas. Nunca carrega uma sessão administrativa na vitrine. */
(() => {
'use strict';
const A=window.CelinaAPI;
const baseline=structuredClone(window.STORE_CONFIG);
const safeImage=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.href:'';}catch{return '';}};
function defaults(){
 return {id:1,configured:false,revision:1,whatsapp:baseline.whatsapp||'',instagram:baseline.instagram||'',email:baseline.email||'',hours:baseline.hours||'',announcement_enabled:true,announcement:baseline.announcement||'',hero_image_path:null,hero_image_url:baseline.hero.image||'',hero_eyebrow:baseline.hero.eyebrow||'',hero_title:baseline.hero.title||'',hero_description:baseline.hero.description||'',hero_button_label:'Conhecer a coleção',hero_target:'all',hero_category_id:null};
}
function values(row){return row?.configured?{...defaults(),...row}:{...defaults(),id:row?.id||1,revision:row?.revision||1,updated_at:row?.updated_at};}
function image(row){return row.hero_image_path?A.publicImage(row.hero_image_path):safeImage(row.hero_image_url)||baseline.hero.image;}
function apply(row){
 if(!row?.configured)return false;
 const C=window.STORE_CONFIG;
 C.remoteSettingsActive=true;
 C.whatsapp=/^\d{10,15}$/.test(row.whatsapp)?row.whatsapp:'';
 C.instagram=/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/.test(row.instagram)?row.instagram:'';
 C.email=row.email;C.hours=row.hours;C.announcement=row.announcement;C.announcementEnabled=row.announcement_enabled;
 C.hero={...C.hero,image:image(row),eyebrow:row.hero_eyebrow,title:row.hero_title,description:row.hero_description,buttonLabel:row.hero_button_label,target:row.hero_target,categoryId:row.hero_category_id};
 return true;
}
function destination(row,base=''){
 const h=row?.hero_target!==undefined?{target:row.hero_target,categoryId:row.hero_category_id}:window.STORE_CONFIG.hero;
 if(h.target==='whatsapp'){
  const phone=row?.whatsapp??window.STORE_CONFIG.whatsapp;
  return /^\d{10,15}$/.test(phone)?'https://wa.me/'+phone+'?text='+encodeURIComponent('Olá! Gostaria de conhecer as peças da Celina.') : base+'categoria.html';
 }
 if(h.target==='category'){
  const cats=window.CATALOG_CATEGORIES||[];const cat=cats.find(c=>c.id===h.categoryId&&c.active!==false);
  if(cat)return base+'categoria.html?categoria='+encodeURIComponent(cat.name);
 }
 return base+'categoria.html';
}
window.CelinaSettings={defaults,values,image,apply,destination,
 async load({strict=false}={}){
  try{const rows=await A.rows('store_settings',{select:'*',id:'eq.1',limit:1},false);if(!Array.isArray(rows)||rows.length!==1)throw new Error('As configurações da loja ainda não foram preparadas no banco.');return rows[0];}
  catch(error){if(strict)throw error;console.warn('Configurações remotas indisponíveis. Usando config.js.',error.message);return null;}
 }
};
})();
