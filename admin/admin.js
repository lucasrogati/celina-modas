/* Painel da Celina: a autorização efetiva é sempre aplicada pelo banco (RLS). */
(async()=>{
'use strict';
const A=window.CelinaAPI,$=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const uid=()=>crypto.randomUUID();
let products=[],categories=[],editing=null,photos=[],colors=[],sizes=['PP','P','M','G','GG'],busy=false,dirty=false,photoBusy=false,pendingEditor=false,timer;
function notice(message){$('#notice').textContent=message;$('#notice').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('#notice').hidden=true,7000);}
function screen(name){for(const n of ['login','list','editor'])$('#'+n+'-panel').hidden=n!==name;$('#initial-status').hidden=true;$('#logout').hidden=name==='login';window.scrollTo(0,0);const title=$('#'+name+'-panel h1');if(title){title.tabIndex=-1;title.focus();}}
function lock(value){busy=value;$('#product-fields').disabled=value;$('#save-product').disabled=value;$('#cancel-edit').disabled=value;$('#back-to-list').disabled=value;$('#logout').disabled=value;document.body.classList.toggle('busy',value);$('#save-product').textContent=value?'Salvando…':'Salvar produto';}
function revokePreviews(){photos.forEach(p=>{if(p.preview?.startsWith('blob:'))URL.revokeObjectURL(p.preview);});}
function list(){
 const q=$('#search-products').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),filter=$('#status-filter').value;
 const rows=products.filter(p=>p.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)&&(filter==='all'||filter==='soldout'?(filter==='all'||p.status==='published'&&!p.product_variants.some(v=>v.available)):p.status===filter));
 $('#list-count').textContent=`${rows.length} peça(s) · Atualize a lista para ver alterações de outro dispositivo.`;
 $('#product-list').innerHTML=rows.length?rows.map(p=>{
  const image=[...p.product_images].sort((a,b)=>a.sort_order-b.sort_order)[0];
  const available=p.product_variants.some(v=>v.available),cat=categories.find(c=>c.id===p.category_id);
  const badge=p.status==='draft'?'Rascunho':p.status==='archived'?'Oculto':cat&&!cat.active?'Categoria desativada':available?'No catálogo':'Esgotado';
  return `<article class="item"><img src="${esc(image?A.publicImage(image.storage_path):'../assets/images/placeholder.svg')}" alt="${esc(p.name)}" loading="lazy"><div><h2>${esc(p.name)}</h2><p>${money(p.price)}</p><span class="badge">${badge}</span><p>${esc(cat?.name||'Sem categoria')}</p></div><div class="item-actions"><button data-edit="${esc(p.id)}">Editar</button>${available?`<button data-soldout="${esc(p.id)}">Marcar esgotado</button>`:''}<button data-duplicate="${esc(p.id)}">Duplicar</button></div></article>`;
 }).join(''):'<div class="empty"><h2>Nenhuma peça aqui</h2><p>Adicione uma peça ou mude os filtros.</p></div>';
}
async function load(){
 const [cats,rows]=await Promise.all([A.allRows('categories',{select:'*',order:'sort_order.asc,id.asc'},true),A.allRows('products',{select:'*,product_variants(*),product_images(*)',order:'updated_at.desc,id.asc'},true)]);
 categories=cats;products=rows;list();
}
function categoryOptions(selected){$('#product-category').innerHTML='<option value="">Escolha uma categoria</option>'+categories.filter(c=>c.active||c.id===selected).map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(c.name)}${c.active?'':' (desativada)'}</option>`).join('');}
function renderPhotos(){
 $('#photos').innerHTML=photos.map((p,i)=>`<div class="photo"><img src="${esc(p.preview||A.publicImage(p.storage_path))}" alt="Foto ${i+1}"><small>${i===0?'Capa':'Foto '+(i+1)}</small><div class="actions"><button type="button" data-photo-up="${i}" ${i===0?'disabled':''} aria-label="Mover foto ${i+1} para antes">←</button><button type="button" data-photo-remove="${i}" aria-label="Remover foto ${i+1}">Remover</button></div></div>`).join('');
}
function readMatrix(){
 colors.forEach((c,i)=>{const input=$(`[data-color-name="${i}"]`),hex=$(`[data-color-hex="${i}"]`);if(input)c.name=input.value;if(hex)c.hex=hex.value;});
 $$('[data-size-check]').forEach(el=>{const c=colors[Number(el.dataset.colorIndex)];if(c)c.available[el.dataset.sizeCheck]=el.checked;});
}
function renderColors(){
 $('#colors').innerHTML=colors.map((c,i)=>`<div class="color-row"><div class="color-head"><label>Nome da cor<input data-color-name="${i}" value="${esc(c.name)}" maxlength="80" placeholder="Ex.: Bege" required></label><label style="flex:0" aria-label="Escolher tom da cor"><span class="hint">Tom</span><input type="color" data-color-hex="${i}" value="${esc(c.hex)}"></label><button type="button" data-remove-color="${i}" aria-label="Remover cor ${esc(c.name)}" ${colors.length===1?'disabled':''}>Remover</button></div><div class="sizes">${sizes.map(s=>`<label><input type="checkbox" data-size-check="${esc(s)}" data-color-index="${i}" ${c.available[s]?'checked':''}>${esc(s)}</label>`).join('')}</div></div>`).join('');
}
function edit(p=null){
 revokePreviews();editing=p?structuredClone(p):null;dirty=false;
 $('#editor-title').textContent=p?'Editar peça':'Nova peça';$('#product-form').reset();$('#save-status').textContent='';
 $('#product-name').value=p?.name||'';$('#product-price').value=p?Number(p.price).toFixed(2).replace('.',','):'';
 $('#product-description').value=p?.description||'';$('#product-care').value=p?.care||'';$('#product-new').checked=!!p?.is_new;
 $('#product-status').value=p?.status||'published';categoryOptions(p?.category_id);
 photos=p?[...p.product_images].sort((a,b)=>a.sort_order-b.sort_order).map(i=>({...i})):[];
 const variants=p?.product_variants||[];
 sizes=variants.length?[...new Set(variants.sort((a,b)=>a.sort_order-b.sort_order).map(v=>v.size))]:['PP','P','M','G','GG'];
 colors=[...new Set(variants.map(v=>v.color_name))].map(name=>({name,hex:variants.find(v=>v.color_name===name)?.color_hex||'#0d6172',available:Object.fromEntries(variants.filter(v=>v.color_name===name).map(v=>[v.size,v.available]))}));
 if(!colors.length)colors=[{name:'',hex:'#0d6172',available:Object.fromEntries(sizes.map(s=>[s,true]))}];
 $('#sizes-input').value=sizes.join(', ');renderPhotos();renderColors();screen('editor');
}
async function compressed(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Escolha fotos JPG, PNG ou WebP.');
 if(file.size>20*1024*1024)throw new Error('Uma foto tem mais de 20 MB. Escolha uma versão menor.');
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;await image.decode();
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const context=canvas.getContext('2d');if(!context)throw new Error('Seu navegador não conseguiu preparar a foto.');context.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.85));
  if(!blob||blob.size>5*1024*1024)throw new Error('Não foi possível reduzir a foto para até 5 MiB.');
  return blob;
 }finally{URL.revokeObjectURL(url);}
}
async function choosePhotos(files){
 if(photos.length+files.length>10){notice('Use no máximo 10 fotos por peça.');return;}
 photoBusy=true;$('#save-product').disabled=true;$('#photo-status').textContent='Preparando fotos…';
 try{for(const f of files){const blob=await compressed(f);photos.push({blob,preview:URL.createObjectURL(blob)});dirty=true;}renderPhotos();$('#photo-status').textContent='Fotos preparadas. Toque em Salvar produto para enviar.';}
 catch(e){renderPhotos();$('#photo-status').textContent=e.message;}
 finally{photoBusy=false;$('#photo-files').value='';$('#save-product').disabled=false;}
}
function priceValue(){const raw=$('#product-price').value.trim().replace(/\s/g,'');const value=Number(raw.includes(',')?raw.replace(/\./g,'').replace(',','.'):raw);if(!raw||!Number.isFinite(value)||value<0||value>=1e9)throw new Error('Informe um preço válido, como 129,90.');return Math.round(value*100)/100;}
function desiredVariants(id){
 const names=colors.map(c=>c.name.trim().toLowerCase());if(new Set(names).size!==names.length||names.some(n=>!n))throw new Error('Informe nomes diferentes para as cores.');
 return colors.flatMap(c=>sizes.map((s,i)=>({product_id:id,color_name:c.name.trim(),color_hex:c.hex,size:s,available:!!c.available[s],sort_order:i})));
}
async function patchOne(id,data,expected){
 const result=await A.mutation('products','PATCH',data,{id:'eq.'+id,...(expected?{updated_at:'eq.'+expected}:{})});
 if(result?.length!==1)throw new Error('A peça mudou em outro dispositivo ou o acesso foi removido. Volte à lista e atualize antes de editar novamente.');
 return result[0];
}
async function save(event){
 event.preventDefault();if(busy||photoBusy)return;
 if(!$('#product-form').reportValidity())return;
 let id=editing?.id||uid(),desired,data,targetStatus=$('#product-status').value;
 try{
  readMatrix();if(!photos.length)throw new Error('Adicione pelo menos uma foto.');
  if(!sizes.length||!colors.length)throw new Error('Informe cores e tamanhos.');
  desired=desiredVariants(id);
  data={name:$('#product-name').value.trim(),price:priceValue(),category_id:$('#product-category').value,description:$('#product-description').value.trim(),care:$('#product-care').value.trim(),is_new:$('#product-new').checked,status:'draft'};
  if(!data.name)throw new Error('Informe o nome da peça.');
 }catch(e){notice(e.message);return;}
 let savedSuccessfully=false;lock(true);$('#save-status').textContent='Salvando a peça como rascunho e enviando as fotos…';
 try{
  if(!await A.isAdmin())throw new Error('Sua conta não está autorizada para esta operação.');
  let saved;
  if(editing)saved=await patchOne(id,data,editing.updated_at);
  else {const created=await A.mutation('products','POST',{id,...data});if(created?.length!==1)throw new Error('Não foi possível criar o rascunho.');saved=created[0];}
  editing={...saved,product_images:editing?.product_images||[],product_variants:editing?.product_variants||[]};
  // Reutiliza os caminhos após falhas para evitar uploads repetidos no mesmo formulário.
  for(const p of photos){if(!p.storage_path){const ext=p.blob.type==='image/png'?'png':p.blob.type==='image/jpeg'?'jpg':'webp';p.storage_path=id+'/'+uid()+'.'+ext;try{await A.upload(p.storage_path,p.blob);}catch(e){delete p.storage_path;throw e;}}}
  const existingVariants=await A.rows('product_variants',{select:'*',product_id:'eq.'+id},true);
  const retained=new Set();
  for(const v of desired){
   const old=existingVariants.find(o=>o.color_name===v.color_name&&o.size===v.size);
   if(old){await A.mutation('product_variants','PATCH',v,{id:'eq.'+old.id});retained.add(old.id);}else await A.mutation('product_variants','POST',v);
  }
  for(const old of existingVariants)if(!retained.has(old.id))await A.mutation('product_variants','DELETE',undefined,{id:'eq.'+old.id});
  const existingImages=await A.rows('product_images',{select:'*',product_id:'eq.'+id},true);
  const newPaths=new Set(photos.map(p=>p.storage_path));
  for(let i=0;i<photos.length;i++){
   const p=photos[i],old=existingImages.find(o=>o.storage_path===p.storage_path),row={product_id:id,storage_path:p.storage_path,alt_text:data.name+' — foto '+(i+1),sort_order:i};
   if(old)await A.mutation('product_images','PATCH',row,{id:'eq.'+old.id});else await A.mutation('product_images','POST',row);
  }
  for(const old of existingImages)if(!newPaths.has(old.storage_path))await A.mutation('product_images','DELETE',undefined,{id:'eq.'+old.id});
  // Publica somente depois de dados, variações e fotos terem sido gravados.
  saved=await patchOne(id,{status:targetStatus},editing.updated_at);editing.updated_at=saved.updated_at;
  savedSuccessfully=true;dirty=false;$('#save-status').textContent='Produto salvo com sucesso.';
  const removed=existingImages.filter(i=>!newPaths.has(i.storage_path)).map(i=>i.storage_path);
  if(removed.length)try{await A.removeFiles(removed);}catch{notice('Peça salva. Algumas fotos antigas precisam de limpeza no armazenamento.');}
  await load();screen('list');notice('Produto salvo. A vitrine mostra a alteração ao abrir ou atualizar a página.');
 }catch(e){
  if(savedSuccessfully){screen('list');notice('Produto salvo, mas a lista não pôde ser recarregada. Toque em Atualizar lista.');return;}
  dirty=true;$('#save-status').textContent='Não foi possível concluir: '+e.message+'\nSe o rascunho foi criado, ele permanece oculto. Seus dados continuam neste formulário; tente salvar novamente. Não considere a operação concluída.';
 }finally{lock(false);}
}
let categoryBusy=false;
function cleanCategoryName(value){return String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ');}
function categoryNameKey(value){return cleanCategoryName(value).toLocaleLowerCase('pt-BR');}
function categoryList(){
 if(!document.getElementById('celina-category-actions-style')){
  const style=document.createElement('style');style.id='celina-category-actions-style';
  style.textContent='#categories-list .category-line{flex-wrap:wrap;align-items:flex-start;gap:12px}#categories-list .category-line>div{display:flex;flex-wrap:wrap;gap:6px}#categories-list .category-meta{display:block;font-size:12px;color:#5e6664}#categories-list [data-delete-category]{color:#9c3f34;border-color:#d7aaa4}#categories-dialog[aria-busy="true"]{cursor:progress}';
  document.head.append(style);
 }
 $('#categories-list').innerHTML=categories.length?categories.map(c=>{
  const count=products.filter(p=>p.category_id===c.id).length;
  return `<div class="category-line"><span>${esc(c.name)}${c.active?'':' (desativada)'}<small class="category-meta">${count} ${count===1?'produto vinculado':'produtos vinculados'}</small></span><div><button type="button" data-rename-category="${esc(c.id)}">Renomear</button><button type="button" data-toggle-category="${esc(c.id)}">${c.active?'Desativar':'Ativar'}</button><button type="button" data-delete-category="${esc(c.id)}" aria-label="Apagar categoria ${esc(c.name)}">Apagar</button></div></div>`;
 }).join(''):'<p class="hint">Nenhuma categoria cadastrada. Use o campo abaixo para criar a primeira.</p>';
}
function categoryError(error){
 if(error.code==='23503')return 'Esta categoria possui produtos vinculados. Transfira todos para outra categoria antes de apagá-la.';
 if(error.code==='23505')return 'Já existe uma categoria com esse nome. Escolha outro nome.';
 if(error.status===401||error.status===403||error.code==='42501')return 'Sua conta não tem permissão para esta alteração. Entre novamente com a conta administradora.';
 return error.message||'Não foi possível concluir a alteração. Tente novamente.';
}
async function categoryTask(fn){
 if(categoryBusy)return;
 categoryBusy=true;const dialog=$('#categories-dialog');dialog.setAttribute('aria-busy','true');
 const previous=Array.from(dialog.querySelectorAll('button,input')).map(el=>[el,el.disabled]);previous.forEach(([el])=>el.disabled=true);
 try{await fn();}catch(error){notice(categoryError(error));}
 finally{categoryBusy=false;dialog.removeAttribute('aria-busy');previous.forEach(([el,disabled])=>{if(el.isConnected)el.disabled=disabled;});}
}
async function deleteCategory(id){
 await categoryTask(async()=>{
  if(!await A.isAdmin())throw new Error('Entre com a conta administradora para apagar categorias.');
  const rows=await A.rows('categories',{select:'id,name',id:'eq.'+id,limit:1},true);
  if(!rows.length){await load();categoryList();notice('Esta categoria já foi removida. A lista foi atualizada.');return;}
  const c=rows[0];
  const linked=await A.rows('products',{select:'id',category_id:'eq.'+id,limit:1},true);
  if(linked.length){await load();categoryList();notice('Não é possível apagar “'+c.name+'”: existem produtos vinculados. Edite as peças e escolha outra categoria, inclusive nos rascunhos e produtos ocultos.');return;}
  if(!confirm('Apagar definitivamente a categoria “'+c.name+'”?\n\nEla será removida do catálogo. Esta ação não apaga produtos e não pode ser desfeita.'))return;
  const latest=await A.rows('products',{select:'id',category_id:'eq.'+id,limit:1},true);
  if(latest.length){await load();categoryList();notice('A categoria recebeu um produto enquanto você confirmava. Transfira a peça antes de apagar.');return;}
  const deleted=await A.mutation('categories','DELETE',undefined,{id:'eq.'+id});
  if(!Array.isArray(deleted)||!deleted.some(row=>row.id===id))throw new Error('A exclusão não foi confirmada. Atualize a lista antes de tentar novamente.');
  categories=categories.filter(row=>row.id!==id);categoryList();
  try{await load();categoryList();notice('Categoria “'+c.name+'” apagada.');}
  catch{notice('Categoria apagada, mas não foi possível recarregar a lista. Atualize o painel.');}
 });
}
async function runButton(button,fn){if(button.disabled)return;button.disabled=true;try{await fn();}catch(e){notice(e.message);}finally{button.disabled=false;}}
$('#login-form').addEventListener('submit',async e=>{
 e.preventDefault();const button=$('#login-form button');await runButton(button,async()=>{try{await A.login($('#login-email').value.trim(),$('#login-password').value);$('#login-password').value='';await load();screen(pendingEditor&&dirty?'editor':'list');pendingEditor=false;}catch(err){$('#login-password').value='';if(err.status===400||err.status===401)throw new Error('Não foi possível entrar. Confira o e-mail e a senha do painel.');throw err;}});
});
$('#logout').onclick=async()=>{if(busy||photoBusy)return;if(dirty&&!confirm('Sair sem concluir as alterações desta peça?'))return;try{await A.logout();}catch{}dirty=false;revokePreviews();screen('login');};
$('#new-product').onclick=()=>edit();$('#search-products').oninput=list;$('#status-filter').onchange=list;
$('#reload-products').onclick=e=>runButton(e.target,load);
const leave=()=>{if(busy||photoBusy)return;if(dirty&&!confirm('Voltar sem salvar as alterações?'))return;dirty=false;revokePreviews();screen('list');};
$('#back-to-list').onclick=leave;$('#cancel-edit').onclick=leave;
$('#product-form').addEventListener('input',()=>dirty=true);$('#product-form').addEventListener('change',()=>dirty=true);
$('#photo-files').onchange=e=>choosePhotos(Array.from(e.target.files));
$('#apply-sizes').onclick=()=>{readMatrix();const next=[...new Set($('#sizes-input').value.split(',').map(s=>s.trim()).filter(Boolean))];if(!next.length||next.length>20||next.some(s=>s.length>30)){notice('Informe de 1 a 20 tamanhos, com até 30 caracteres cada.');return;}sizes=next;dirty=true;renderColors();};
$('#add-color').onclick=()=>{readMatrix();if(colors.length>=12){notice('Use no máximo 12 cores por peça.');return;}colors.push({name:'',hex:'#0d6172',available:Object.fromEntries(sizes.map(s=>[s,true]))});renderColors();dirty=true;};
$('#product-form').onsubmit=save;
$('#manage-categories').onclick=e=>runButton(e.currentTarget,async()=>{if(categoryBusy)return;await load();categoryList();if(!$('#categories-dialog').open)$('#categories-dialog').showModal();});
$('#close-categories').onclick=()=>{if(!categoryBusy)$('#categories-dialog').close();};
$('#categories-dialog').addEventListener('cancel',e=>{if(categoryBusy)e.preventDefault();});
$('#category-form').onsubmit=async e=>{
 e.preventDefault();if(categoryBusy)return;
 const name=cleanCategoryName($('#category-name').value);
 await categoryTask(async()=>{
  if(!name||name.length>100)throw new Error('Informe um nome de categoria com até 100 caracteres.');
  if(!await A.isAdmin())throw new Error('Entre com a conta administradora para criar categorias.');
  const fresh=await A.allRows('categories',{select:'id,name,sort_order',order:'id.asc'},true);
  if(fresh.some(c=>categoryNameKey(c.name)===categoryNameKey(name)))throw new Error('Já existe uma categoria com esse nome.');
  const sortOrder=fresh.reduce((max,c)=>Math.max(max,Number(c.sort_order)||0),0)+1;
  const postSlug=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'categoria';
  const created=await A.mutation('categories','POST',{name,slug:postSlug.slice(0,80)+'-'+uid().slice(0,8),sort_order:sortOrder,active:true});
  if(!Array.isArray(created)||created.length!==1)throw new Error('O cadastro não foi confirmado. Atualize a lista antes de tentar novamente.');
  $('#category-name').value='';categories.push(created[0]);categoryList();
  try{await load();categoryList();notice('Categoria “'+name+'” criada.');}
  catch{notice('Categoria criada, mas a lista não pôde ser recarregada. Atualize o painel.');}
 });
};
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||b.disabled||busy)return;
 if(categoryBusy&&b.closest('#categories-dialog'))return;
 if(b.hasAttribute('data-delete-category')){await deleteCategory(b.dataset.deleteCategory);return;}
 if(b.hasAttribute('data-edit')){edit(products.find(p=>p.id===b.dataset.edit));return;}
 if(b.hasAttribute('data-duplicate')){
  const p=structuredClone(products.find(p=>p.id===b.dataset.duplicate));
  // Não compartilha caminhos: cópias recebem fotos novas para evitar exclusão de arquivo usado por outra peça.
  edit(null);$('#product-name').value=p.name+' (cópia)';$('#product-price').value=Number(p.price).toFixed(2).replace('.',',');$('#product-description').value=p.description;$('#product-care').value=p.care;categoryOptions(p.category_id);
  sizes=[...new Set(p.product_variants.map(v=>v.size))];if(!sizes.length)sizes=['PP','P','M','G','GG'];
  colors=[...new Set(p.product_variants.map(v=>v.color_name))].map(name=>({name,hex:p.product_variants.find(v=>v.color_name===name)?.color_hex||'#0d6172',available:Object.fromEntries(p.product_variants.filter(v=>v.color_name===name).map(v=>[v.size,v.available]))}));if(!colors.length)colors=[{name:'',hex:'#0d6172',available:{}}];
  $('#sizes-input').value=sizes.join(', ');renderColors();dirty=true;notice('Dados copiados. Adicione fotos próprias para a nova peça.');return;
 }
 if(b.hasAttribute('data-soldout')){if(!confirm('Marcar TODOS os tamanhos e cores desta peça como esgotados?'))return;await runButton(b,async()=>{const p=products.find(p=>p.id===b.dataset.soldout);const locked=await patchOne(p.id,{status:'draft'},p.updated_at);await A.mutation('product_variants','PATCH',{available:false},{product_id:'eq.'+p.id});await patchOne(p.id,{status:p.status},locked.updated_at);await load();notice('Peça marcada como esgotada.');});return;}
 if(b.hasAttribute('data-photo-remove')){const i=Number(b.dataset.photoRemove),p=photos.splice(i,1)[0];if(p.preview)URL.revokeObjectURL(p.preview);renderPhotos();dirty=true;return;}
 if(b.hasAttribute('data-photo-up')){const i=Number(b.dataset.photoUp);if(i>0)[photos[i-1],photos[i]]=[photos[i],photos[i-1]];renderPhotos();dirty=true;return;}
 if(b.hasAttribute('data-remove-color')){readMatrix();if(colors.length>1)colors.splice(Number(b.dataset.removeColor),1);renderColors();dirty=true;return;}
 if(b.hasAttribute('data-toggle-category')){const c=categories.find(c=>c.id===b.dataset.toggleCategory);if(!confirm(`${c.active?'Desativar':'Ativar'} a categoria ${c.name}?`))return;await runButton(b,async()=>{await A.mutation('categories','PATCH',{active:!c.active},{id:'eq.'+c.id});await load();categoryList();});return;}
 if(b.hasAttribute('data-rename-category')){const c=categories.find(c=>c.id===b.dataset.renameCategory),name=prompt('Novo nome da categoria:',c.name)?.trim();if(!name)return;if(name.length>100){notice('Use até 100 caracteres.');return;}await runButton(b,async()=>{await A.mutation('categories','PATCH',{name},{id:'eq.'+c.id});await load();categoryList();});}
});
window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue='';}});
window.addEventListener('celina:auth-expired',()=>{pendingEditor=!$('#editor-panel').hidden;notice('Sua sessão terminou. Entre novamente; evite recarregar antes de anotar dados não salvos.');screen('login');});
document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&!e.target.dataset.fallback){e.target.dataset.fallback='1';e.target.src='../assets/images/placeholder.svg';}},true);
try{
 if(!A.session){screen('login');return;}
 if(!await A.isAdmin()){await A.logout();screen('login');notice('Esta conta não tem autorização para administrar a loja.');return;}
 await load();screen('list');
}catch(e){screen('login');notice('Não foi possível verificar o acesso: '+e.message);}
})();
