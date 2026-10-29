/* Carrega os dados ANTES do carrinho, para não usar o catálogo antigo por engano. */
(async()=>{
 const main=document.getElementById('main');
 const status=document.createElement('div');status.className='catalog-loading';status.textContent='Carregando catálogo…';status.setAttribute('role','status');main.prepend(status);
 const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Não foi possível carregar '+src));document.head.append(s);});
 try{
  await load('js/store-settings.js?v=1');
  const settings=await CelinaSettings.load();CelinaSettings.apply(settings);
  await CelinaCatalog.refresh();status.remove();
  await load('js/cart.js');await load('js/main.js');
 }catch(error){
  main.replaceChildren();const box=document.createElement('div');box.className='empty-state';
  const h=document.createElement('h1');h.textContent='Não foi possível carregar o catálogo';
  const p=document.createElement('p');p.textContent='Verifique a conexão e tente novamente. Produtos antigos não serão exibidos como se estivessem disponíveis.';
  const btn=document.createElement('button');btn.className='btn btn-primary';btn.textContent='Tentar novamente';btn.onclick=()=>location.reload();
  box.append(h,p,btn);main.append(box);console.warn('Falha no carregamento do catálogo:',error.message);
 }
})();
