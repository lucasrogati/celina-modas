/* Cliente HTTP pequeno para Auth, PostgREST e Storage. Sem dependências externas. */
(() => {
'use strict';
const C=window.SUPABASE_CONFIG;
const SESSION='celina-admin-session-v1';
let session=null, refreshing=null;
try { session=JSON.parse(sessionStorage.getItem(SESSION)||'null'); } catch {}
function store(s){session=s;try{s?sessionStorage.setItem(SESSION,JSON.stringify(s)):sessionStorage.removeItem(SESSION);}catch{}}
function remember(data){
 if(!data?.access_token||!data?.refresh_token)throw new Error('Resposta de login inválida.');
 store({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at||(Date.now()/1000+data.expires_in),user:data.user});
}
async function raw(path,{method='GET',body,token,headers={},binary=false}={}){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
 try{
  const h={apikey:C.publishableKey,...headers};
  if(token)h.Authorization='Bearer '+token;
  if(body!==undefined&&!binary)h['Content-Type']='application/json';
  const response=await fetch(C.url+path,{method,headers:h,body:body===undefined?undefined:binary?body:JSON.stringify(body),signal:controller.signal,cache:'no-store'});
  const text=await response.text();let data=null;try{data=text?JSON.parse(text):null;}catch{}
  if(!response.ok){const err=new Error(data?.message||data?.error_description||data?.msg||data?.error||'Falha ao acessar o serviço.');err.status=response.status;err.code=data?.code;throw err;}
  return data;
 }catch(e){if(e.name==='AbortError')throw new Error('A conexão demorou demais. Tente novamente.');throw e;}finally{clearTimeout(timer);}
}
async function token(){
 if(!session)throw new Error('Entre novamente para continuar.');
 if(session.expires_at>Date.now()/1000+60)return session.access_token;
 if(!refreshing)refreshing=(async()=>{
  try{remember(await raw('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}}));return session.access_token;}
  catch(e){if(e.status===400||e.status===401){store(null);window.dispatchEvent(new Event('celina:auth-expired'));}throw e;}
 })().finally(()=>refreshing=null);
 return refreshing;
}
async function request(path,opts={}){return raw(path,{...opts,token:opts.admin?await token():undefined});}
const query=(obj)=>new URLSearchParams(Object.entries(obj).filter(([,v])=>v!==undefined)).toString();
async function rows(table,params={},admin=false){return request('/rest/v1/'+table+'?'+query(params),{admin});}
async function allRows(table,params={},admin=false){
 const result=[];let offset=0;
 while(true){const part=await rows(table,{...params,limit:500,offset},admin);if(!Array.isArray(part))throw new Error('Resposta de catálogo inválida.');result.push(...part);if(part.length<500)break;offset+=part.length;}
 return result;
}
async function mutation(table,method,data,params={}){
 return request('/rest/v1/'+table+'?'+query(params),{method,body:data,admin:true,headers:{Prefer:'return=representation'}});
}
window.CelinaAPI={
 config:C, query, rows, allRows, mutation,
 get session(){return session;},
 async login(email,password){
  remember(await raw('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}}));
  try{if(!await this.isAdmin()){await this.logout();throw new Error('Esta conta não tem autorização para administrar a loja.');}}catch(e){store(null);throw e;}
 },
 async isAdmin(){if(!session)return false;return (await request('/rest/v1/rpc/is_catalog_admin',{admin:true,method:'POST',body:{}}))===true;},
 async user(){return request('/auth/v1/user',{admin:true});},
 async logout(){try{if(session)await raw('/auth/v1/logout',{method:'POST',token:session.access_token});}finally{store(null);}},
 publicImage(path){return C.url+'/storage/v1/object/public/'+encodeURIComponent(C.bucket)+'/'+path.split('/').map(encodeURIComponent).join('/');},
 async upload(path,blob){return request('/storage/v1/object/'+encodeURIComponent(C.bucket)+'/'+path.split('/').map(encodeURIComponent).join('/'),{admin:true,method:'POST',body:blob,binary:true,headers:{'Content-Type':blob.type,'x-upsert':'false','cache-control':'3600'}});},
 async removeFiles(paths){if(paths.length)return request('/storage/v1/object/'+encodeURIComponent(C.bucket),{admin:true,method:'DELETE',body:{prefixes:paths}});}
};
})();
