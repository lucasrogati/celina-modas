/* Interface em JavaScript puro. Sem framework, dependências ou etapa de build. */
(() => {
'use strict';
const C=window.STORE_CONFIG, S=window.Shop;
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>Array.from(el.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const query=new URLSearchParams(location.search), page=document.body.dataset.page;
const active=()=>window.PRODUCTS.filter(p=>p.active);
const catURL=c=>'categoria.html?categoria='+encodeURIComponent(c);
const prodURL=id=>'produto.html?id='+encodeURIComponent(id);
const img=(src,alt,cls='')=>`<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" ${cls?`class="${cls}"`:''}>`;
const paths={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',bag:'<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',check:'<path d="m5 12 4 4L19 6"/>',filter:'<path d="M4 6h16M7 12h10M10 18h4"/>'};
const icon=n=>`<svg aria-hidden="true" class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[n]||paths.arrow}</svg>`;
let toastTimer,focusReturn;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,5000);}
function modal(title,html){focusReturn=document.activeElement;$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=html;$('#info-dialog').showModal();}
function contact(message=`Olá, ${C.name}! Gostaria de saber mais sobre as peças da loja.`){try{window.open(S.whatsappURL(message),'_blank','noopener,noreferrer');}catch(e){modal('Atendimento em configuração',`<p>${esc(e.message)}</p>`);}}
function header(){
 const nav=C.categories.map(c=>`<a href="${catURL(c)}">${esc(c)}</a>`).join('');
 $('#site-header').innerHTML=`<div class="announcement" ${C.announcementEnabled===false?'hidden':''}>${esc(C.announcement)}</div><header class="header"><div class="header-main"><button class="icon-btn mobile-only" data-open="menu-panel" aria-label="Abrir menu" aria-controls="menu-panel" aria-expanded="false">${icon('menu')}</button><a class="brand" href="index.html" aria-label="Celina Modas — início"><img src="assets/images/logo.png" alt="Celina Moda Executiva"></a><nav class="desktop-nav" aria-label="Navegação principal"><a href="categoria.html">Novidades</a>${C.categories.slice(0,4).map(c=>`<a href="${catURL(c)}">${esc(c)}</a>`).join('')}</nav><div class="header-actions"><button class="icon-btn" data-search-toggle aria-label="Abrir busca" aria-controls="search-form" aria-expanded="false">${icon('search')}</button><a class="icon-btn favorites-link" href="categoria.html?favoritos=1" aria-label="Favoritos">${icon('heart')}</a><a class="icon-btn bag-btn" href="carrinho.html" aria-label="Sacola"><span data-cart-count>${S.count()}</span>${icon('bag')}</a></div></div><form id="search-form" class="search-bar" action="categoria.html" hidden><label for="search">O que você procura?</label><input id="search" name="busca" type="search" placeholder="Busque por peças ou cores" maxlength="100"><button type="submit" class="btn btn-text">Buscar</button><button type="button" class="icon-btn" data-search-toggle aria-label="Fechar busca">${icon('close')}</button></form></header><div class="drawer-overlay" id="panel-overlay" data-close-panel hidden></div><aside id="menu-panel" class="drawer" aria-label="Menu de categorias" hidden inert><div class="drawer-head"><span>Menu</span><button class="icon-btn" data-close-panel aria-label="Fechar menu">${icon('close')}</button></div><nav><a href="categoria.html">Todas as peças</a>${nav}<a href="categoria.html?favoritos=1">Favoritos</a></nav><div class="drawer-links"><button data-contact>Atendimento pelo WhatsApp →</button></div></aside>`;
}
function footer(){
 $('#site-footer').innerHTML=`<footer><div class="footer-main page-width"><div class="footer-brand"><a href="index.html"><img src="assets/images/logo.png" alt="Celina Moda Executiva" loading="lazy"></a><p>Elegância, versatilidade e confiança para acompanhar cada momento.</p>${C.instagram?`<a href="${esc(C.instagram)}" target="_blank" rel="noopener noreferrer">Instagram ↗</a>`:''}</div><div><h3>Explore</h3><a href="categoria.html">Todas as peças</a>${C.categories.slice(0,4).map(c=>`<a href="${catURL(c)}">${esc(c)}</a>`).join('')}</div><div><h3>Atendimento</h3><button data-contact>Fale conosco</button><a href="informacoes.html?secao=como-comprar">Como comprar</a><a href="informacoes.html?secao=trocas">Trocas e devoluções</a><a href="informacoes.html?secao=entregas">Entrega e retirada</a></div><div><h3>Institucional</h3><a href="index.html#sobre">Sobre a Celina</a><a href="informacoes.html?secao=privacidade">Privacidade</a><a href="informacoes.html?secao=medidas">Guia de medidas</a></div><div class="contact"><h3>Fale com a gente</h3><button data-contact>Atendimento pelo WhatsApp →</button>${C.email?`<a href="mailto:${esc(C.email)}">${esc(C.email)}</a>`:''}<small>${esc(C.hours)}</small></div></div><div class="footer-bottom page-width"><span>© ${new Date().getFullYear()} ${esc(C.name)}.</span><a href="admin/index.html" style="color:inherit">Área da loja</a></div></footer>`;
}
function card(p){
 const liked=S.favorites().includes(p.id);
 return `<article class="product-card"><div class="product-image">${p.soldOut?'<span class="tag">Esgotado</span>':p.new?'<span class="tag">Novidade</span>':''}<button class="favorite ${liked?'active':''}" data-favorite="${esc(p.id)}" aria-pressed="${liked}" aria-label="${liked?'Remover dos':'Adicionar aos'} favoritos: ${esc(p.name)}">${icon('heart')}</button><a class="image-button" href="${prodURL(p.id)}">${img(p.image,p.name)}</a><a class="btn btn-light quick-add" href="${prodURL(p.id)}">Ver detalhes</a></div><a class="product-info" href="${prodURL(p.id)}"><h3>${esc(p.name)}</h3><p>${money(p.price)}</p><small>Consulte pelo WhatsApp</small><span class="swatches" aria-label="Cores disponíveis">${p.colors.map(c=>`<i style="background-color:${esc(c.hex)}" title="${esc(c.name)}"></i>`).join('')}</span></a></article>`;
}
function home(){
 $('#hero-image').src=C.hero.image;$('#hero-eyebrow').textContent=C.hero.eyebrow;$('.hero-content h1').textContent=C.hero.title;$('#hero-description').textContent=C.hero.description;
 const heroButton=$('.hero-content .btn');heroButton.textContent=(C.hero.buttonLabel||'Conhecer a coleção')+' →';heroButton.href=window.CelinaSettings.destination();if(C.hero.target==='whatsapp'){heroButton.target='_blank';heroButton.rel='noopener noreferrer';}
 $('#editorial-one').src=C.editorialImages[0];$('#editorial-two').src=C.editorialImages[1];$('#about-text').textContent=C.about;
 $('#home-categories').innerHTML=C.categories.map(c=>{const p=active().find(p=>p.category===c);return `<a class="category-card" href="${catURL(c)}">${img(p?.image||'assets/images/placeholder.svg',c)}<span>${esc(c)}${icon('arrow')}</span></a>`;}).join('');
 $('#home-products').innerHTML=active().length?active().map(card).join(''):'<div class="empty-state"><h2>Novidades em breve</h2><p>Estamos preparando as peças do catálogo.</p></div>';
}
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let filters={category:query.get('categoria')||'',size:'',color:'',max:0,sort:'recent'};
function filterHTML(){
 const colors=[...new Set(active().flatMap(p=>p.colors.map(c=>c.name)))];
 return `<div class="filter-group"><h3>Categoria</h3><select data-filter="category" aria-label="Filtrar categoria"><option value="">Todas as peças</option>${C.categories.map(c=>`<option ${filters.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="filter-group"><h3>Tamanho</h3><div class="size-filter">${['PP','P','M','G','GG'].map(s=>`<button data-filter-size="${s}" aria-pressed="${filters.size===s}" class="${filters.size===s?'selected':''}">${s}</button>`).join('')}</div></div><div class="filter-group"><h3>Cor</h3><select data-filter="color" aria-label="Filtrar cor"><option value="">Todas as cores</option>${colors.map(c=>`<option ${filters.color===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="filter-group"><h3>Preço máximo</h3><label>Até (R$)<input data-filter="max" type="number" min="0" step="10" placeholder="Sem limite" value="${filters.max||''}"></label></div><button class="btn btn-outline" data-reset-filters>Limpar filtros</button>`;
}
function results(){
 const term=norm(query.get('busca')||'');
 let list=active().filter(p=>(!query.has('favoritos')||S.favorites().includes(p.id))&&(!filters.category||p.category===filters.category)&&(!(filters.size||filters.color)||p.variants.some(v=>v.available&&(!filters.size||v.size===filters.size)&&(!filters.color||v.color_name===filters.color)))&&(!filters.max||p.price<=filters.max)&&(!term||norm(p.name+' '+p.category+' '+p.colors.map(c=>c.name).join(' ')).includes(term)));
 if(filters.sort==='low')list.sort((a,b)=>a.price-b.price);else if(filters.sort==='high')list.sort((a,b)=>b.price-a.price);else list.sort((a,b)=>Number(b.new)-Number(a.new));
 $('#result-count').textContent=`${list.length} ${list.length===1?'peça':'peças'}`;
 $('#catalog-products').innerHTML=list.length?list.map(card).join(''):`<div class="empty-state"><h2>Nenhuma peça encontrada</h2><p>${query.has('favoritos')?'Salve seus favoritos tocando no coração dos produtos.':'Tente outra busca ou ajuste os filtros.'}</p><a class="btn btn-outline" href="categoria.html">Ver todas as peças</a></div>`;
 $('#catalog-title').textContent=query.has('favoritos')?'Seus favoritos':query.get('busca')?`Busca: ${query.get('busca')}`:filters.category||'Todas as peças';
 const bits=[filters.category,filters.size,filters.color,filters.max?`Até ${money(filters.max)}`:''].filter(Boolean);
 $('#active-filters').innerHTML=bits.length?`<button data-reset-filters>Limpar seleção: ${esc(bits.join(' · '))} ×</button>`:'';
}
function category(){
 $('#main').innerHTML=`<div class="breadcrumb page-width"><a href="index.html">Início</a><span>› Coleção</span></div><section class="category-header page-width"><p class="eyebrow">Alfaiataria essencial</p><h1 id="catalog-title"></h1><p class="catalog-title-info">Estrutura, leveza e presença. Encontre peças para acompanhar a sua rotina.</p><div class="active-filters" id="active-filters"></div></section><div class="catalog-toolbar page-width"><span id="result-count"></span><div><button class="btn btn-outline filter-trigger" data-open="filter-panel" aria-controls="filter-panel" aria-expanded="false">${icon('filter')} Filtrar</button><label>Ordenar por: <select id="sort"><option value="recent">Novidades</option><option value="low">Menor preço</option><option value="high">Maior preço</option></select></label></div></div><section class="catalog page-width"><aside class="desktop-filters" aria-label="Filtros"><div data-filter-controls>${filterHTML()}</div></aside><div class="product-grid catalog-grid" id="catalog-products"></div></section><aside class="filter-drawer" id="filter-panel" aria-label="Filtros de produtos" hidden inert><div class="filter-mobile-head"><h2>Filtrar</h2><button class="icon-btn" data-close-panel aria-label="Fechar filtros">${icon('close')}</button></div><div data-filter-controls>${filterHTML()}</div><button class="btn btn-primary full" data-close-panel>Ver resultados</button></aside>`;
 results();
}
function refreshFilterControls(){ $$('[data-filter-controls]').forEach(el=>el.innerHTML=filterHTML());results(); }
function measures(){return '<p>Cada modelagem pode ter medidas diferentes. Informe a peça e o tamanho desejados ao atendimento para receber as medidas reais antes da compra.</p><p>Para comparar com uma peça sua, meça busto, cintura, quadril e comprimento, sem apertar a fita métrica.</p><button class="btn btn-primary" data-contact>Consultar medidas pelo WhatsApp</button>';}
let selectedSize='',selectedColor='',currentProduct;
function product(){
 const p=S.product(query.get('id')); currentProduct=p;
 if(!p){$('#main').innerHTML='<div class="empty-state"><h2>Peça não encontrada</h2><a class="btn btn-primary" href="categoria.html">Voltar à coleção</a></div>';return;}
 document.title=p.name+' | '+C.name; selectedColor=p.colors[0]?.name||'';
 $('#main').innerHTML=`<div class="breadcrumb page-width"><a href="index.html">Início</a><span>›</span><a href="${catURL(p.category)}">${esc(p.category)}</a><span>› ${esc(p.name)}</span></div><section class="product-detail page-width"><div class="gallery">${(p.images?.length?p.images:[p.image]).map((u,i)=>`<img src="${esc(u)}" alt="${esc(p.name)}, imagem ${i+1}" data-zoom tabindex="0" role="button" aria-label="Ampliar imagem de ${esc(p.name)}" ${i?'loading="lazy"':''}>`).join('')}</div><div class="product-panel"><p class="eyebrow">Coleção Celina</p><h1>${esc(p.name)}</h1><div class="sku">REF. ${esc(p.id.toUpperCase())}</div><p class="detail-price">${money(p.price)}</p><p class="installment">Pagamento e entrega combinados pelo WhatsApp.</p><div class="choice"><div><strong>Cor</strong><span id="selected-color">${esc(selectedColor)}</span></div><div class="color-options">${p.colors.map((c,i)=>`<button type="button" style="background-color:${esc(c.hex)}" class="${i===0?'selected':''}" data-color="${esc(c.name)}" aria-label="${esc(c.name)}" aria-pressed="${i===0}"></button>`).join('')}</div></div><div class="choice" id="size-choice"><div><strong>Tamanho</strong><button class="measure" data-measures>Guia de medidas</button></div><div class="size-options">${p.sizes.map(s=>`<button type="button" data-size="${esc(s)}" aria-pressed="false" ${(p.unavailableSizes||[]).includes(s)?'disabled aria-label="'+esc(s)+' indisponível"':''}>${esc(s)}</button>`).join('')}</div><small class="error-text" id="size-error" role="alert" hidden>Selecione um tamanho disponível para continuar.</small></div><button class="btn btn-primary full add-cart" data-add>Adicionar à sacola <span>${money(p.price)}</span></button><button class="btn btn-outline full favorite-detail" data-favorite="${esc(p.id)}" aria-pressed="${S.favorites().includes(p.id)}">${icon('heart')} Salvar nos favoritos</button><div class="contact-note">Selecione suas peças e envie a sacola pelo WhatsApp. A equipe confirma disponibilidade, valores, pagamento e entrega antes de fechar a compra.</div><details open><summary>Descrição ${icon('plus')}</summary><p>${esc(p.description)}</p></details><details><summary>Composição e cuidados ${icon('plus')}</summary><p>${esc(p.care)}</p></details></div></section><section class="you-may-like page-width"><div class="section-heading"><div><p class="eyebrow">Complete o look</p><h2>Você também pode gostar</h2></div></div><div class="product-grid">${active().filter(x=>x.id!==p.id).slice(0,4).map(card).join('')}</div></section>`;
 updateVariantChoices();
}
function updateVariantChoices(){
 if(!currentProduct)return;
 $$('[data-size]').forEach(b=>{const available=window.CelinaCatalog.available(currentProduct,b.dataset.size,selectedColor);b.disabled=!available;b.setAttribute('aria-label',b.dataset.size+(available?'':' indisponível nesta cor'));b.classList.toggle('selected',b.dataset.size===selectedSize&&available);b.setAttribute('aria-pressed',String(b.dataset.size===selectedSize&&available));});
 if(selectedSize&&!window.CelinaCatalog.available(currentProduct,selectedSize,selectedColor))selectedSize='';
 const add=$('[data-add]');if(add){add.disabled=currentProduct.soldOut;if(currentProduct.soldOut)add.textContent='Peça esgotada';}
}
function cart(){
 const items=S.items();
 $('#main').innerHTML=`<div class="cart-title"><p class="eyebrow">Sua seleção</p><h1>Sacola</h1><span>${S.count()} ${S.count()===1?'item':'itens'}</span></div>`;
 if(!items.length){$('#main').insertAdjacentHTML('beforeend','<div class="empty-state"><h2>Sua sacola está esperando por você.</h2><p>Escolha suas peças favoritas para montar seu pedido.</p><a class="btn btn-primary" href="categoria.html">Conhecer a coleção</a></div>');return;}
 $('#main').insertAdjacentHTML('beforeend',`<div class="cart-layout"><section class="cart-items" aria-label="Itens da sacola">${items.map((i,k)=>`<article class="cart-item">${img(i.product.image,i.product.name)}<div class="cart-item-info"><div><h2><a href="${prodURL(i.id)}">${esc(i.product.name)}</a></h2><button data-remove="${k}" aria-label="Remover ${esc(i.product.name)}">${icon('close')}</button></div><p>Cor: ${esc(i.color)} · Tamanho: ${esc(i.size)}</p><p class="mobile-price">${money(i.product.price)} cada</p><div class="cart-item-bottom"><div class="quantity"><button data-quantity="${k}" data-delta="-1" aria-label="Diminuir quantidade de ${esc(i.product.name)}" ${i.quantity<=1?'disabled':''}>${icon('minus')}</button><span aria-label="Quantidade">${i.quantity}</span><button data-quantity="${k}" data-delta="1" aria-label="Aumentar quantidade de ${esc(i.product.name)}" ${i.quantity>=99?'disabled':''}>${icon('plus')}</button></div><strong>${money(Math.round(i.product.price*100)*i.quantity/100)}</strong></div></div></article>`).join('')}<a class="btn btn-text" href="categoria.html">← Continuar comprando</a></section><aside class="cart-summary"><h2>Resumo do pedido</h2><div class="summary-lines"><p><span>Subtotal das peças</span><span>${money(S.total())}</span></p><p><span>Entrega ou retirada</span><span>A combinar no atendimento</span></p><p><span>Pagamento</span><span>A combinar pelo WhatsApp</span></p></div><div class="summary-total"><span>Subtotal</span><strong>${money(S.total())}</strong></div><form id="order-form"><label>Seu nome (opcional)<input id="customer-name" name="nome" autocomplete="given-name" maxlength="80"></label><label>Observações (opcional)<textarea id="order-note" name="observacoes" placeholder="Dúvidas, preferência de retirada..." maxlength="600"></textarea></label><p class="order-note">Ao continuar, o WhatsApp abrirá com as peças, cores, tamanhos e quantidades. Revise e envie a mensagem para consultar disponibilidade. Isso não confirma a compra nem realiza pagamento.</p>${!C.whatsapp?'<p class="setup-note">O WhatsApp da loja ainda não foi configurado.</p>':''}<button type="submit" class="btn btn-primary full">Enviar pedido pelo WhatsApp ${icon('arrow')}</button></form><p class="secure">Sem cadastro · Atendimento direto com a loja</p></aside></div>`);
}
function information(){
 const pages={
 'como-comprar':['Como comprar','<p>Escolha uma peça, selecione cor e tamanho e adicione à sacola. Você pode combinar diferentes peças no mesmo pedido.</p><p>Na sacola, confira quantidades e subtotal e clique em “Enviar pedido pelo WhatsApp”. Revise e envie a mensagem no aplicativo. Nossa equipe confirma disponibilidade, valores, entrega ou retirada e condições de pagamento antes de fechar a compra.</p><p>Não realizamos cobrança neste site. O envio da mensagem não confirma automaticamente a compra.</p>'],
 'entregas':['Entrega e retirada','<p>Converse com nosso atendimento para consultar as opções disponíveis para sua região, os valores e os prazos antes de confirmar a compra.</p><p>O subtotal da sacola considera somente as peças. Nenhum valor de frete é calculado ou cobrado pelo site.</p>'],
 'trocas':['Trocas e devoluções','<p>Fale com a Celina pelo WhatsApp para receber as orientações de troca e devolução aplicáveis ao seu pedido, respeitados os direitos previstos na legislação.</p><p>Não estabelecemos prazos ou condições comerciais fictícios nesta página. A loja deve revisar e complementar estas informações antes de publicar.</p>'],
 'privacidade':['Privacidade','<p>Esta versão usa o armazenamento local do navegador para lembrar sua sacola e seus favoritos. Não há cadastro de conta para clientes, coleta de cartão, ferramenta de análise ou newsletter integrada. Existe uma área restrita para a administradora, com autenticação pelo Supabase.</p><p>Ao optar por enviar um pedido, os itens e as informações opcionais preenchidas são inseridos em um link que abre o WhatsApp. A mensagem é enviada somente quando você a confirma no aplicativo. Os dados passam a ser tratados também conforme as políticas do serviço.</p><p>O catálogo e as fotos cadastradas são carregados do Supabase, que recebe dados técnicos de conexão. As fotos demonstrativas e fontes podem ser carregadas de serviços externos (Unsplash e Google Fonts), que recebem dados técnicos de conexão. Para remover essa dependência, substitua as fotos e fontes por arquivos locais.</p><p>A loja deve completar esta política com seus dados reais, canais de contato, finalidades, prazos de retenção e procedimentos de exercício de direitos antes de publicar.</p>'],
 'medidas':['Guia de medidas',measures()]
 };
 const [title,body]=pages[query.get('secao')]||pages['como-comprar'];
 document.title=title+' | '+C.name;
 $('#main').innerHTML=`<p class="eyebrow">Celina Modas</p><h1>${title}</h1>${body}<button class="btn btn-primary" data-contact>Falar com a Celina →</button>`;
}
let panel=null,lastPanelTrigger=null;
function closePanel(){if(!panel)return;panel.classList.remove('open');panel.hidden=true;panel.inert=true;panel=null;$('#panel-overlay').hidden=true;document.body.classList.remove('panel-open');$$('[data-open]').forEach(b=>b.setAttribute('aria-expanded','false'));lastPanelTrigger?.focus();}
function openPanel(id,trigger){closePanel();panel=document.getElementById(id);if(!panel)return;lastPanelTrigger=trigger;panel.hidden=false;panel.inert=false;panel.classList.add('open');$('#panel-overlay').hidden=false;$('#panel-overlay').classList.add('open');document.body.classList.add('panel-open');trigger.setAttribute('aria-expanded','true');$('button,a,input,select',panel)?.focus();}
header();footer();
if(page==='index')home();else if(page==='categoria')category();else if(page==='produto')product();else if(page==='carrinho')cart();else information();
document.addEventListener('error',e=>{const el=e.target;if(el.tagName==='IMG'&&!el.dataset.fallback){el.dataset.fallback='1';el.src='assets/images/placeholder.svg';}},true);
document.addEventListener('click',e=>{
 const b=e.target.closest('button,a,[data-zoom]');if(!b)return;
 if(b.hasAttribute('data-contact')){contact();return;}
 if(b.hasAttribute('data-close-dialog')){$('#info-dialog').close();return;}
 if(b.hasAttribute('data-open')){openPanel(b.dataset.open,b);return;}
 if(b.hasAttribute('data-close-panel')){closePanel();return;}
 if(b.hasAttribute('data-search-toggle')){const form=$('#search-form');form.hidden=!form.hidden;$$('[data-search-toggle]').forEach(x=>x.setAttribute('aria-expanded',String(!form.hidden)));if(!form.hidden)$('#search').focus();return;}
 if(b.hasAttribute('data-favorite')){S.toggleFavorite(b.dataset.favorite);toast(S.favorites().includes(b.dataset.favorite)?'Peça salva nos favoritos.':'Peça removida dos favoritos.');return;}
 if(b.hasAttribute('data-filter-size')){filters.size=filters.size===b.dataset.filterSize?'':b.dataset.filterSize;refreshFilterControls();return;}
 if(b.hasAttribute('data-reset-filters')){filters={...filters,category:'',size:'',color:'',max:0};refreshFilterControls();return;}
 if(b.hasAttribute('data-color')){selectedColor=b.dataset.color;selectedSize='';$('#selected-color').textContent=selectedColor;$$('[data-color]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});updateVariantChoices();return;}
 if(b.hasAttribute('data-size')){selectedSize=b.dataset.size;$('#size-error').hidden=true;$('#size-choice').classList.remove('has-error');$$('[data-size]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});return;}
 if(b.hasAttribute('data-add')){if(!selectedSize||!window.CelinaCatalog.available(currentProduct,selectedSize,selectedColor)){$('#size-error').hidden=false;$('#size-choice').classList.add('has-error');$('[data-size]:not(:disabled)')?.focus();return;}try{S.add(currentProduct.id,selectedSize,selectedColor);modal('Adicionado à sacola',`<p>${esc(currentProduct.name)} · ${esc(selectedColor)} · ${esc(selectedSize)}</p><p><a class="btn btn-primary" href="carrinho.html">Ver sacola e enviar pedido →</a></p><button class="btn btn-outline" data-close-dialog>Continuar comprando</button>`);}catch(err){toast(err.message);}return;}
 if(b.hasAttribute('data-remove')){S.remove(Number(b.dataset.remove));return;}
 if(b.hasAttribute('data-quantity')){const index=Number(b.dataset.quantity),it=S.items()[index];if(it)S.quantity(index,it.quantity+Number(b.dataset.delta));return;}
 if(b.hasAttribute('data-measures')){modal('Guia de medidas',measures());return;}
 if(b.hasAttribute('data-zoom')){modal('Detalhes da peça',`<img src="${esc(b.src)}" alt="${esc(b.alt)}">`);}
});
$('#panel-overlay').addEventListener('click',closePanel);
$('#info-dialog').addEventListener('close',()=>focusReturn?.focus());
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){closePanel();$('#search-form').hidden=true;$$('[data-search-toggle]').forEach(x=>x.setAttribute('aria-expanded','false'));}
 if(panel&&e.key==='Tab'){const all=$$('button:not(:disabled),a,input,select',panel).filter(x=>!x.hidden);const first=all[0],last=all[all.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 if((e.key==='Enter'||e.key===' ')&&e.target.hasAttribute('data-zoom')){e.preventDefault();e.target.click();}
});
document.addEventListener('change',e=>{
 const el=e.target;
 if(el.matches('[data-filter]')){filters[el.dataset.filter]=el.dataset.filter==='max'?Math.max(0,Number(el.value)||0):el.value;refreshFilterControls();}
 if(el.id==='sort'){filters.sort=el.value;results();}
});
document.addEventListener('submit',async e=>{if(e.target.id!=='order-form')return;e.preventDefault();
 const button=$('button[type=submit]',e.target),name=$('#customer-name').value,note=$('#order-note').value;
 const oldSignature=JSON.stringify(S.items().map(i=>[i.id,i.size,i.color,i.quantity,i.product.price]));
 button.disabled=true;button.textContent='Conferindo disponibilidade…';
 try{
  const latestSettings=await window.CelinaSettings.load({strict:!!C.remoteSettingsActive});window.CelinaSettings.apply(latestSettings);
  await window.CelinaCatalog.refresh();S.reconcile();
  const signature=JSON.stringify(S.items().map(i=>[i.id,i.size,i.color,i.quantity,i.product.price]));
  if(signature!==oldSignature){modal('Revise a sacola','<p>O preço ou a disponibilidade de uma peça mudou. Confira os itens e clique novamente para continuar.</p>');return;}
  const message=S.orderMessage(name,note),url=S.whatsappURL(message);
  modal('Pedido pronto',`<p>Seu pedido foi conferido. Abra o WhatsApp, revise e envie a mensagem para confirmar os detalhes com a loja.</p><a class="btn btn-primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp →</a><p>A disponibilidade não é reservada pelo site.</p>`);
 }catch(err){toast('Não foi possível continuar: '+err.message);}
 finally{const current=$('#order-form button[type=submit]');if(current){current.disabled=false;current.innerHTML='Enviar pedido pelo WhatsApp '+icon('arrow');}}
});
window.addEventListener('celina:change',()=>{
 $$('[data-cart-count]').forEach(el=>el.textContent=S.count());
 $$('[data-favorite]').forEach(b=>{const liked=S.favorites().includes(b.dataset.favorite);b.classList.toggle('active',liked);b.setAttribute('aria-pressed',String(liked));if(b.classList.contains('favorite'))b.setAttribute('aria-label',(liked?'Remover dos':'Adicionar aos')+' favoritos: '+S.product(b.dataset.favorite)?.name);});
 if(page==='categoria'&&query.has('favoritos'))results();
 if(page==='carrinho'){
   const name=$('#customer-name')?.value||'',note=$('#order-note')?.value||'';
   const focused=document.activeElement,quantityIndex=focused?.dataset.quantity,delta=focused?.dataset.delta,removeIndex=focused?.dataset.remove;
   cart();if($('#customer-name')){$('#customer-name').value=name;$('#order-note').value=note;}
   if(quantityIndex!==undefined)$(`[data-quantity="${quantityIndex}"][data-delta="${delta}"]`)?.focus();
   else if(removeIndex!==undefined)($('[data-remove]')||$('.empty-state a'))?.focus();
 }
});
window.addEventListener('resize',()=>{if(innerWidth>900)closePanel();});
})();
