/* Editor das configurações públicas da loja. As permissões são impostas no Supabase. */
(async()=>{
'use strict';
const A=window.CelinaAPI,S=window.CelinaSettings,$=s=>document.querySelector(s);
let loaded=null,categories=[],pendingPhoto=null,dirty=false,busy=false,photoBusy=false,mode='desktop',saveDone=false;
const inputIds=['store-whatsapp','store-instagram','store-email','store-hours','announcement-text','hero-eyebrow','hero-title','hero-description','hero-button-label','hero-target','hero-category'];
function message(text,error=false){$('#save-message').textContent=text;$('#save-message').classList.toggle('error',error);}
function phone(value){return String(value||'').replace(/\D/g,'');}
function instagram(value){
 const text=value.trim();if(!text)return '';
 const source=text.startsWith('@')?'https://www.instagram.com/'+text.slice(1):/^[A-Za-z0-9_.]+$/.test(text)?'https://www.instagram.com/'+text:/^(www\.)?instagram\.com\//i.test(text)?'https://'+text:text;
 let url;try{url=new URL(source);}catch{throw new Error('Informe um perfil válido do Instagram, como @celinamodas.');}
 if(url.protocol!=='https:'||!['instagram.com','www.instagram.com'].includes(url.hostname.toLowerCase())||!/^\/[A-Za-z0-9_.]+\/?$/.test(url.pathname))throw new Error('Use o endereço de um perfil do Instagram, não de uma publicação.');
 return 'https://www.instagram.com/'+url.pathname.split('/')[1]+'/';
}
function data(validate=false){
 const row={configured:true,whatsapp:phone($('#store-whatsapp').value),instagram:$('#store-instagram').value.trim(),email:$('#store-email').value.trim(),hours:$('#store-hours').value.trim(),announcement_enabled:$('#announcement-enabled').checked,announcement:$('#announcement-text').value.trim(),hero_image_path:pendingPhoto?.path||loaded?.hero_image_path||null,hero_image_url:loaded?.hero_image_url||'',hero_eyebrow:$('#hero-eyebrow').value.trim(),hero_title:$('#hero-title').value.trim(),hero_description:$('#hero-description').value.trim(),hero_button_label:$('#hero-button-label').value.trim(),hero_target:$('#hero-target').value,hero_category_id:$('#hero-target').value==='category'?$('#hero-category').value||null:null};
 if(validate){
  if(!/^\d{10,15}$/.test(row.whatsapp))throw new Error('Informe o WhatsApp com código do país, DDD e número (10 a 15 dígitos).');
  row.instagram=instagram(row.instagram);
  if(!row.hero_title||!row.hero_button_label)throw new Error('Preencha o título do banner e o texto do botão.');
  if(row.announcement_enabled&&!row.announcement)throw new Error('Escreva o aviso ou desative sua exibição.');
  if(row.hero_target==='category'&&!categories.some(c=>c.id===row.hero_category_id&&c.active))throw new Error('Selecione uma categoria ativa para o botão.');
  if(!pendingPhoto&&!row.hero_image_path&&!row.hero_image_url)throw new Error('Escolha uma foto para o banner.');
 }
 return row;
}
function setPhoto(photo){if(pendingPhoto?.preview)URL.revokeObjectURL(pendingPhoto.preview);pendingPhoto=photo;$('#undo-photo').hidden=!photo;}
function fill(row){
 loaded=S.values(row);setPhoto(null);
 $('#store-whatsapp').value=loaded.whatsapp;$('#store-instagram').value=loaded.instagram;$('#store-email').value=loaded.email;$('#store-hours').value=loaded.hours;$('#announcement-enabled').checked=loaded.announcement_enabled;$('#announcement-text').value=loaded.announcement;
 $('#hero-eyebrow').value=loaded.hero_eyebrow;$('#hero-title').value=loaded.hero_title;$('#hero-description').value=loaded.hero_description;$('#hero-button-label').value=loaded.hero_button_label;$('#hero-target').value=loaded.hero_target;
 const select=$('#hero-category');select.replaceChildren(new Option('Escolha uma categoria',''));
 categories.forEach(c=>select.add(new Option(c.name,c.id)));
 if(loaded.hero_category_id&&!categories.some(c=>c.id===loaded.hero_category_id)){const option=new Option('Categoria indisponível — escolha outra',loaded.hero_category_id);option.disabled=true;select.add(option);}
 select.value=loaded.hero_category_id||'';$('#banner-file').value='';$('#photo-message').textContent='';dirty=false;preview();
}
function scalePreview(){
 const node=$('#preview-page'),width=mode==='mobile'?390:1100,scale=Math.min(1,$('#preview-viewport').clientWidth/width);
 node.style.transform='scale('+scale+')';$('#preview-viewport').style.height=(node.scrollHeight*scale)+'px';
}
function preview(){
 if(!loaded)return;const row=data();
 $('#announcement-text').required=row.announcement_enabled;
 $('#category-choice').hidden=row.hero_target!=='category';$('#hero-category').required=row.hero_target==='category';
 $('#preview-page').classList.toggle('mobile',mode==='mobile');
 $('#preview-announcement').hidden=!row.announcement_enabled;$('#preview-announcement').textContent=row.announcement;
 $('#preview-image').src=pendingPhoto?.preview||S.image(row);
 $('#preview-eyebrow').textContent=row.hero_eyebrow;$('#preview-title').textContent=row.hero_title;$('#preview-description').textContent=row.hero_description;$('#preview-button').textContent=(row.hero_button_label||'Botão')+' →';
 $('#preview-phone').textContent=row.whatsapp||'Não preenchido';$('#preview-instagram').textContent=row.instagram||'Não informado';$('#preview-email').textContent=row.email||'Não informado';$('#preview-hours').textContent=row.hours||'Não informado';
 $('#preview-destination').textContent=row.hero_target==='whatsapp'?'Atendimento pelo WhatsApp':row.hero_target==='category'?(categories.find(c=>c.id===row.hero_category_id)?.name||'Selecione uma categoria'):'Todas as peças';
 scalePreview();
}
function lock(value){busy=value;$('#settings-fields').disabled=value;for(const id of ['save-settings','cancel-settings','reload-settings'])$('#'+id).disabled=value;$('#save-settings').textContent=value?'Salvando…':'Salvar alterações';}
async function reload(){
 categories=await A.allRows('categories',{select:'id,name,active,sort_order',active:'eq.true',order:'sort_order.asc,id.asc'},true);
 const raw=await S.load({strict:true});fill(raw);
}
async function preparePhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Escolha uma foto JPG, PNG ou WebP.');
 if(file.size>20*1024*1024)throw new Error('A foto tem mais de 20 MB. Escolha uma versão menor.');
 const url=URL.createObjectURL(file);
 try{const image=new Image();image.src=url;await image.decode();const ratio=Math.min(1,2200/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));const context=canvas.getContext('2d');if(!context)throw new Error('Não foi possível preparar a imagem neste navegador.');context.drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.86));if(!blob||blob.size>5*1024*1024)throw new Error('Não foi possível preparar a foto com até 5 MiB.');return {blob,preview:URL.createObjectURL(blob),path:null};}finally{URL.revokeObjectURL(url);}
}
$('#settings-form').addEventListener('input',()=>{dirty=true;preview();});$('#settings-form').addEventListener('change',()=>{dirty=true;preview();});
$('#banner-file').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file||busy||photoBusy)return;photoBusy=true;$('#save-settings').disabled=true;$('#banner-file').disabled=true;$('#photo-message').textContent='Preparando foto…';
 try{setPhoto(await preparePhoto(file));dirty=true;$('#photo-message').textContent='Foto preparada. A troca só será publicada ao salvar.';preview();}catch(error){$('#photo-message').textContent=error.message;}finally{photoBusy=false;$('#save-settings').disabled=false;$('#banner-file').disabled=false;$('#banner-file').value='';}
});
$('#undo-photo').onclick=()=>{if(busy||photoBusy)return;setPhoto(null);dirty=true;$('#photo-message').textContent='Troca de foto desfeita.';preview();};
$('#preview-image').addEventListener('load',scalePreview);$('#preview-image').addEventListener('error',e=>{if(!e.target.src.endsWith('/assets/images/placeholder.svg'))e.target.src='../assets/images/placeholder.svg';});
for(const type of ['desktop','mobile'])$('#preview-'+type).onclick=()=>{mode=type;$('#preview-desktop').setAttribute('aria-pressed',String(type==='desktop'));$('#preview-mobile').setAttribute('aria-pressed',String(type==='mobile'));preview();};
new ResizeObserver(scalePreview).observe($('#preview-viewport'));window.addEventListener('resize',scalePreview);
$('#test-whatsapp').onclick=()=>{const number=phone($('#store-whatsapp').value);if(!/^\d{10,15}$/.test(number)){message('Preencha o WhatsApp com país, DDD e número para testar.',true);return;}window.open('https://wa.me/'+number+'?text='+encodeURIComponent('Olá! Esta é uma conferência do contato da Celina.'),'_blank','noopener,noreferrer');};
$('#cancel-settings').onclick=()=>{if(busy||photoBusy)return;if(dirty&&!confirm('Descartar as alterações que ainda não foram salvas?'))return;fill(loaded);message('Os campos voltaram à última versão carregada.');};
$('#reload-settings').onclick=async()=>{if(busy||photoBusy)return;if(dirty&&!confirm('Recarregar os dados salvos e descartar as alterações locais?'))return;lock(true);try{await reload();message('Configurações recarregadas.');}catch(error){message('Não foi possível recarregar: '+error.message,true);}finally{lock(false);}};
$('#settings-form').onsubmit=async e=>{
 e.preventDefault();if(busy||photoBusy||!loaded)return;if(!$('#settings-form').reportValidity())return;
 let row;try{row=data(true);}catch(error){message(error.message,true);return;}
 lock(true);saveDone=false;message('Salvando alterações…');
 try{
  if(!await A.isAdmin())throw new Error('Sua conta não tem autorização para alterar a loja.');
  if(pendingPhoto&&!pendingPhoto.path){
   const ext=pendingPhoto.blob.type==='image/png'?'png':pendingPhoto.blob.type==='image/jpeg'?'jpg':'webp';const path='settings/banner-'+crypto.randomUUID()+'.'+ext;
   await A.upload(path,pendingPhoto.blob);pendingPhoto.path=path;
  }
  row=data(true);
  const saved=await A.mutation('store_settings','PATCH',row,{id:'eq.1',revision:'eq.'+loaded.revision});
  if(!Array.isArray(saved)||saved.length!==1)throw new Error('As configurações mudaram em outra aba ou dispositivo. Seus campos foram preservados. Use Recarregar dados do banco para conferir antes de salvar novamente.');
  saveDone=true;fill(saved[0]);message('Alterações salvas! As clientes verão a nova versão ao abrir ou atualizar o catálogo.');
 }catch(error){
  message('Não foi possível concluir: '+error.message+'\nOs campos foram preservados. Se houve falha de conexão, confira os dados salvos antes de repetir. Uma foto enviada pode continuar no armazenamento mesmo se a gravação não for concluída.',true);
 }finally{lock(false);}
};
window.addEventListener('beforeunload',e=>{if(dirty||busy||photoBusy){e.preventDefault();e.returnValue='';}});
window.addEventListener('celina:auth-expired',()=>{message('A sessão expirou. Entre novamente na área de produtos; preserve os textos não salvos antes de sair.',true);$('#settings-fields').disabled=true;$('#save-settings').disabled=true;});
try{
 if(!A.session){$('#access-status').textContent='Entre na área de produtos com a conta administradora e depois abra Minha loja.';return;}
 if(!await A.isAdmin()){$('#access-status').textContent='Esta conta não tem autorização para alterar as configurações.';return;}
 await reload();$('#settings-content').hidden=false;$('#access-status').hidden=true;preview();
}catch(error){$('#access-status').textContent='Não foi possível carregar Minha loja: '+error.message+'\nSe a tabela store_settings ainda não foi criada, aguarde a aplicação da migração no Supabase. Nenhuma alteração foi feita.';}
})();
