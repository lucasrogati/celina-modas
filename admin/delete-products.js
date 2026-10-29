/* Complemento para o painel HTML da Celina. Não executa exclusões ao carregar. */
(() => {
'use strict';
if(window.__celinaDeletionInstalled)return;
const A=window.CelinaAPI,list=document.getElementById('product-list');
if(!A||!list){console.warn('Exclusão: use este complemento com o painel Supabase da Celina.');return;}
window.__celinaDeletionInstalled=true;
const $=id=>document.getElementById(id);
let target=null,working=false,removed=false,refreshOnClose=false,previousFocus=null,pendingPhotos=[],skippedPhotos=0;
const dialog=document.createElement('dialog');dialog.id='celina-delete-dialog';dialog.setAttribute('aria-labelledby','celina-delete-title');
const heading=document.createElement('h2');heading.id='celina-delete-title';heading.textContent='Excluir produto definitivamente?';
const name=document.createElement('p');name.style.fontWeight='700';name.style.overflowWrap='anywhere';
const explanation=document.createElement('p');explanation.className='hint';explanation.textContent='O produto, suas combinações de cor e tamanho e as fotos vinculadas serão removidos. Não há lixeira nem botão de desfazer. Para tirar uma peça temporariamente do catálogo, use Ocultar.';
const label=document.createElement('label');label.textContent='Para confirmar, digite EXCLUIR';
const input=document.createElement('input');input.type='text';input.autocomplete='off';input.spellcheck=false;input.maxLength=20;input.placeholder='EXCLUIR';label.append(input);
const result=document.createElement('p');result.id='celina-delete-result';result.setAttribute('role','status');result.setAttribute('aria-live','polite');result.style.whiteSpace='pre-line';result.style.overflowWrap='anywhere';
const actions=document.createElement('div');actions.className='title-row';actions.style.flexWrap='wrap';
const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancelar';
const confirm=document.createElement('button');confirm.type='button';confirm.textContent='Excluir definitivamente';confirm.style.background='#9c3f34';confirm.style.color='white';confirm.style.borderColor='#9c3f34';confirm.disabled=true;
const retry=document.createElement('button');retry.type='button';retry.textContent='Tentar limpar as fotos restantes';retry.hidden=true;
actions.append(cancel,confirm,retry);dialog.append(heading,name,explanation,label,result,actions);document.body.append(dialog);
function setWorking(value){working=value;cancel.disabled=value;input.disabled=value;confirm.disabled=value||removed||input.value.trim().toUpperCase()!=='EXCLUIR';retry.disabled=value;dialog.setAttribute('aria-busy',String(value));}
function refresh(){const button=$('reload-products');if(button&&!button.disabled)button.click();}
function decorate(){
 list.querySelectorAll('[data-edit]').forEach(edit=>{
  const parent=edit.closest('.item-actions');if(!parent||parent.querySelector('[data-delete-product]'))return;
  const button=document.createElement('button');button.type='button';button.dataset.deleteProduct=edit.dataset.edit;button.textContent='Excluir';button.style.color='#9c3f34';button.style.borderColor='#9c3f34';parent.append(button);
 });
}
new MutationObserver(decorate).observe(list,{childList:true,subtree:true});decorate();
input.addEventListener('input',()=>{confirm.disabled=working||removed||!target||input.value.trim().toUpperCase()!=='EXCLUIR';});
cancel.addEventListener('click',()=>{if(!working)dialog.close();});
dialog.addEventListener('cancel',e=>{if(working)e.preventDefault();});
dialog.addEventListener('close',()=>{if(refreshOnClose)refresh();previousFocus?.isConnected&&previousFocus.focus();});
async function cleanup(){
 if(!pendingPhotos.length)return;
 await A.removeFiles(pendingPhotos);
 pendingPhotos=[];
}
function completed(){
 result.textContent='Produto excluído definitivamente.'+(pendingPhotos.length?' As fotos ainda precisam ser removidas.':skippedPhotos?' Algumas imagens usam caminhos fora da pasta desta peça e não foram apagadas automaticamente. Confira o Storage antes de removê-las.':' As fotos vinculadas também foram removidas.');
 cancel.textContent='Fechar';confirm.hidden=true;label.hidden=true;retry.hidden=!pendingPhotos.length;
}
list.addEventListener('click',async e=>{
 const button=e.target.closest('[data-delete-product]');if(!button||working)return;
 e.preventDefault();e.stopImmediatePropagation();
 target=null;removed=false;refreshOnClose=false;pendingPhotos=[];skippedPhotos=0;previousFocus=button;
 name.textContent='Carregando a peça…';result.textContent='';input.value='';label.hidden=false;confirm.hidden=false;confirm.disabled=true;retry.hidden=true;cancel.textContent='Cancelar';
 dialog.showModal();setWorking(true);
 try{
  if(!await A.isAdmin())throw new Error('Sua conta não tem autorização para excluir produtos.');
  const rows=await A.rows('products',{select:'id,name,updated_at,product_images(storage_path)',id:'eq.'+button.dataset.deleteProduct},true);
  if(!Array.isArray(rows)||rows.length!==1)throw new Error('A peça não está disponível. Atualize a lista.');
  target=rows[0];name.textContent=target.name;
  const paths=[...new Set((target.product_images||[]).map(i=>i.storage_path).filter(p=>typeof p==='string'&&p))];
  pendingPhotos=paths.filter(p=>p.startsWith(target.id+'/')&&!p.split('/').includes('..'));
  skippedPhotos=paths.length-pendingPhotos.length;
 }catch(err){name.textContent='Não foi possível preparar a exclusão.';result.textContent=err.message;label.hidden=true;confirm.hidden=true;refreshOnClose=true;}
 finally{setWorking(false);if(target)input.focus();else cancel.focus();}
});
confirm.addEventListener('click',async()=>{
 if(working||removed||!target||input.value.trim().toUpperCase()!=='EXCLUIR')return;
 setWorking(true);result.textContent='Excluindo a peça…';
 try{
  if(!await A.isAdmin())throw new Error('Sua autorização não está mais disponível. Entre novamente.');
  // O timestamp evita excluir silenciosamente uma peça editada desde a confirmação.
  const rows=await A.mutation('products','DELETE',undefined,{id:'eq.'+target.id,updated_at:'eq.'+target.updated_at});
  if(!Array.isArray(rows)||rows.length!==1){refreshOnClose=true;throw new Error('A peça mudou, já foi removida ou a permissão foi revogada. Feche e atualize a lista antes de tentar novamente.');}
  removed=true;refreshOnClose=true;
  result.textContent='Produto excluído. Removendo as fotos…';
  try{await cleanup();completed();}
  catch(err){completed();result.textContent+='\nA limpeza do armazenamento falhou: '+err.message+'\nVocê pode tentar limpar as fotos novamente antes de fechar esta janela.';}
 }catch(err){
  if(!removed){refreshOnClose=true;target=null;label.hidden=true;confirm.hidden=true;cancel.textContent='Fechar e atualizar';result.textContent='Não foi possível confirmar a exclusão: '+err.message+'\nConfira a lista antes de repetir. Se houve falha de conexão, a operação pode ter sido concluída no servidor.';}
 }finally{setWorking(false);cancel.focus();}
});
retry.addEventListener('click',async()=>{
 if(working||!removed||!pendingPhotos.length)return;
 setWorking(true);result.textContent='Tentando remover as fotos restantes…';
 try{if(!await A.isAdmin())throw new Error('Entre novamente como administradora.');await cleanup();completed();}
 catch(err){completed();result.textContent+='\nNão foi possível limpar as fotos: '+err.message+'\nCaminhos pendentes no bucket celina-products:\n'+pendingPhotos.join('\n');}
 finally{setWorking(false);cancel.focus();}
});
})();
