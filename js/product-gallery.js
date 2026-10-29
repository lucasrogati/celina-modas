/* Complemento da página de produto. Não modifica Supabase, carrinho ou configurações. */
(() => {
'use strict';
function install(gallery){
 if(gallery.dataset.carouselReady==='true')return;
 const originals=Array.from(gallery.querySelectorAll(':scope > img'));
 if(!originals.length)return;
 gallery.dataset.carouselReady='true';gallery.classList.add('cg-enhanced');
 gallery.setAttribute('role','region');gallery.setAttribute('aria-roledescription','carrossel');gallery.setAttribute('aria-label','Fotos do produto');
 const thumbs=document.createElement('div');thumbs.className='cg-thumbs';thumbs.setAttribute('role','group');thumbs.setAttribute('aria-label','Escolher foto');
 const stage=document.createElement('div');stage.className='cg-stage';
 const track=document.createElement('div');track.className='cg-track';track.tabIndex=0;track.setAttribute('aria-label','Galeria de fotos. Use as setas do teclado ou deslize para trocar de foto.');
 const counter=document.createElement('span');counter.className='cg-counter';counter.setAttribute('role','status');counter.setAttribute('aria-live','polite');counter.setAttribute('aria-atomic','true');
 const prev=document.createElement('button');prev.type='button';prev.className='cg-arrow cg-prev';prev.textContent='‹';prev.setAttribute('aria-label','Foto anterior');
 const next=document.createElement('button');next.type='button';next.className='cg-arrow cg-next';next.textContent='›';next.setAttribute('aria-label','Próxima foto');
 let index=0,raf=0,pointer=null,suppressClickUntil=0;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const slides=[],buttons=[];
 function revealThumb(button){
  const rect=button.getBoundingClientRect(),bounds=thumbs.getBoundingClientRect();
  if(rect.left<bounds.left)thumbs.scrollLeft-=bounds.left-rect.left;
  else if(rect.right>bounds.right)thumbs.scrollLeft+=rect.right-bounds.right;
  if(rect.top<bounds.top)thumbs.scrollTop-=bounds.top-rect.top;
  else if(rect.bottom>bounds.bottom)thumbs.scrollTop+=rect.bottom-bounds.bottom;
 }
 function update(target){
  index=Math.max(0,Math.min(originals.length-1,target));
  buttons.forEach((b,i)=>{b.setAttribute('aria-current',String(i===index));b.tabIndex=i===index?0:-1;});
  slides.forEach((s,i)=>{s.setAttribute('aria-hidden',String(i!==index));s.querySelector('img').tabIndex=i===index?0:-1;});
  counter.textContent=(index+1)+' / '+originals.length;counter.setAttribute('aria-label','Foto '+(index+1)+' de '+originals.length);
  prev.disabled=index===0;next.disabled=index===originals.length-1;
  if(buttons[index])revealThumb(buttons[index]);
 }
 function go(target,smooth=true){
  const nextIndex=Math.max(0,Math.min(originals.length-1,target));
  track.scrollTo({left:nextIndex*track.clientWidth,behavior:smooth&&!reduced()?'smooth':'instant'});update(nextIndex);
 }
 originals.forEach((original,i)=>{
  const slide=document.createElement('div');slide.className='cg-slide';slide.setAttribute('role','group');slide.setAttribute('aria-label','Foto '+(i+1)+' de '+originals.length);
  const image=original.cloneNode(true);image.removeAttribute('id');image.draggable=false;image.loading=i===0?'eager':'lazy';
  if(!image.alt)image.alt='Foto '+(i+1)+' do produto';
  slide.append(image);slides.push(slide);track.append(slide);
  const button=document.createElement('button');button.type='button';button.className='cg-thumb';button.setAttribute('aria-label','Mostrar foto '+(i+1)+' de '+originals.length);
  const thumb=document.createElement('img');thumb.src=original.currentSrc||original.src;thumb.alt='';thumb.loading='lazy';thumb.draggable=false;button.append(thumb);
  button.addEventListener('click',()=>go(i));buttons.push(button);thumbs.append(button);
 });
 stage.append(track,prev,next,counter);gallery.replaceChildren(thumbs,stage);
 if(originals.length===1){gallery.classList.add('cg-single');thumbs.hidden=true;prev.hidden=true;next.hidden=true;}
 prev.addEventListener('click',()=>go(index-1));next.addEventListener('click',()=>go(index+1));
 gallery.addEventListener('keydown',event=>{
  const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(event.key))return;
  event.preventDefault();const target=event.key==='Home'?0:event.key==='End'?originals.length-1:index+(event.key==='ArrowRight'?1:-1);
  const thumbFocused=thumbs.contains(document.activeElement);go(target);if(thumbFocused)buttons[index].focus({preventScroll:true});
 });
 track.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(track.clientWidth)update(Math.round(track.scrollLeft/track.clientWidth));});},{passive:true});
 track.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  pointer={id:event.pointerId,x:event.clientX,y:event.clientY,left:track.scrollLeft,dragging:false,type:event.pointerType};
 });
 track.addEventListener('pointermove',event=>{
  if(!pointer||pointer.id!==event.pointerId)return;
  const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
  if(pointer.type==='mouse'){
   if(!pointer.dragging&&Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)){pointer.dragging=true;track.classList.add('cg-dragging');track.setPointerCapture(event.pointerId);}
   if(pointer.dragging){event.preventDefault();track.scrollLeft=pointer.left-dx;suppressClickUntil=Date.now()+500;}
  }else if(Math.abs(dx)>10||Math.abs(dy)>10)suppressClickUntil=Date.now()+500;
 });
 function endPointer(event){
  if(!pointer||pointer.id!==event.pointerId)return;const dragged=pointer.dragging;pointer=null;track.classList.remove('cg-dragging');
  if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);
  if(dragged){suppressClickUntil=Date.now()+500;go(Math.round(track.scrollLeft/track.clientWidth));}
 }
 track.addEventListener('pointerup',endPointer);track.addEventListener('pointercancel',endPointer);
 track.addEventListener('click',event=>{if(Date.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
 const resize=new ResizeObserver(()=>go(index,false));resize.observe(track);
 update(0);
}
function start(){
 const main=document.getElementById('main');if(!main)return;
 const tryInstall=()=>{const gallery=main.querySelector('.product-detail .gallery');if(!gallery)return false;install(gallery);return gallery.dataset.carouselReady==='true';};
 if(tryInstall())return;
 const observer=new MutationObserver(()=>{if(tryInstall())observer.disconnect();});observer.observe(main,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
