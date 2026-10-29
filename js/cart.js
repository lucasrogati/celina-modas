/* Carrinho e favoritos locais. Nenhum pedido é enviado sem ação da cliente. */
(() => {
  const KEY = 'celina-cart-v1', FAV = 'celina-favorites-v1';
  const read = (key) => { try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : []; } catch { return []; } };
  const save = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* Mantém funcionando em memória. */ } };
  const product = id => window.PRODUCTS.find(p => p.id === id && p.active);
  const valid = (p,size,color) => window.CelinaCatalog.available(p,size,color);
  let items = read(KEY).filter(i => i && typeof i === 'object' && valid(product(i.id),i.size,i.color)).map(i => ({id:i.id,size:i.size,color:i.color,quantity:Math.max(1,Math.min(99,Math.floor(Number(i.quantity)||1)))}));
  let favorites = [...new Set(read(FAV).filter(id => !!product(id)))];
  const changed = () => { save(KEY,items); save(FAV,favorites); window.dispatchEvent(new Event('celina:change')); };
  window.Shop = {
    product,
    reconcile() { const before=JSON.stringify(items); items=items.filter(i=>valid(product(i.id),i.size,i.color)); changed(); return before!==JSON.stringify(items); },
    items: () => items.map(i => ({...i, product:product(i.id)})),
    count: () => items.reduce((sum,i) => sum+i.quantity,0),
    total: () => items.reduce((sum,i) => sum+Math.round(product(i.id).price*100)*i.quantity,0)/100,
    add(id,size,color) {
      if (!valid(product(id),size,color)) throw new Error('Selecione uma cor e um tamanho disponíveis.');
      const existing = items.find(i=>i.id===id&&i.size===size&&i.color===color);
      if(existing) existing.quantity=Math.min(99,existing.quantity+1); else items.push({id,size,color,quantity:1});
      changed();
    },
    quantity(index,n) { if(!items[index]) return; items[index].quantity=Math.max(1,Math.min(99,Math.floor(Number(n)||1))); changed(); },
    remove(index) {items.splice(index,1);changed();},
    favorites:()=>[...favorites],
    toggleFavorite(id) { if(!product(id)) return; favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id]; changed(); },
    whatsappURL(message) {
      const phone = String(window.STORE_CONFIG.whatsapp || '').trim();
      if(!/^\d{10,15}$/.test(phone)) throw new Error('O WhatsApp da loja ainda não foi configurado. Defina o número em js/config.js antes de publicar.');
      return 'https://wa.me/'+phone+'?text='+encodeURIComponent(message);
    },
    orderMessage(name='',note='') {
      if(!items.length) throw new Error('Sua sacola está vazia.');
      if(items.some(i=>!valid(product(i.id),i.size,i.color)))throw new Error('A disponibilidade mudou. Revise a sacola.');
      const money=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
      const lines=items.map((i,index)=>{const p=product(i.id);return `${index+1}. ${p.name} (Ref. ${p.id})\nCor: ${i.color} | Tamanho: ${i.size}\nQuantidade: ${i.quantity}\nValor unitário: ${money(p.price)} | Subtotal: ${money(Math.round(p.price*100)*i.quantity/100)}`;});
      return `Olá, ${window.STORE_CONFIG.name}! Gostaria de consultar este pedido:${name.trim()?'\nMeu nome: '+name.trim():''}\n\n${lines.join('\n\n')}\n\nSubtotal das peças: ${money(this.total())}\nFrete/retirada e forma de pagamento: a combinar no atendimento.${note.trim()?'\nObservações: '+note.trim():''}\n\nPodem confirmar os valores e a disponibilidade?`;
    }
  };
})();
