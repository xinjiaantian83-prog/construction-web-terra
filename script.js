const GA4_EVENT_NAMES=new Set(['view_price','click_plan','click_contact','click_demo','click_blog','click_line','click_phone','click_email']);
const ga4MeasurementId=window.SITE_CONFIG?.ga4MeasurementId?.trim();

if(ga4MeasurementId){
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments)};
  window.gtag('js',new Date());
  window.gtag('config',ga4MeasurementId);

  const ga4Script=document.createElement('script');
  ga4Script.async=true;
  ga4Script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4MeasurementId)}`;
  document.head.appendChild(ga4Script);
}

document.addEventListener('click',event=>{
  const target=event.target.closest('[data-ga-event]');
  if(!target||!window.gtag)return;
  const eventName=target.dataset.gaEvent;
  if(!GA4_EVENT_NAMES.has(eventName))return;
  const eventParams={
    link_url:target.href||undefined,
    link_text:target.textContent.trim().replace(/\s+/g,' '),
    placement:target.dataset.gaLabel||undefined,
    page_type:document.body.dataset.pageType||'home',
    landing_page:document.body.dataset.landingPage||window.location.pathname,
  };
  window.gtag('event',eventName,eventParams);
});

const priceSection=document.querySelector('#price');
if(priceSection){
  let priceViewed=false;
  let priceObserver;
  const trackPriceView=()=>{
    if(priceViewed||!window.gtag)return;
    const rect=priceSection.getBoundingClientRect();
    if(rect.top>window.innerHeight*.75||rect.bottom<0)return;
    priceViewed=true;
    window.gtag('event','view_price',{placement:'price',section_id:'price',page_type:document.body.dataset.pageType||'home',landing_page:document.body.dataset.landingPage||window.location.pathname});
    priceObserver?.disconnect();
    window.removeEventListener('scroll',trackPriceView);
  };
  if('IntersectionObserver' in window){
    priceObserver=new IntersectionObserver(trackPriceView,{threshold:0});
    priceObserver.observe(priceSection);
  }
  window.addEventListener('scroll',trackPriceView,{passive:true});
  requestAnimationFrame(trackPriceView);
}

const header=document.querySelector('.site-header');
const menu=document.querySelector('.menu-button');
menu?.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く')});
document.querySelectorAll('.desktop-nav a').forEach(a=>a.addEventListener('click',()=>{header.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false')}));

const photos=document.querySelector('#sortablePhotos');
let dragged=null;
photos?.addEventListener('dragstart',e=>{dragged=e.target.closest('.demo-photo');dragged?.classList.add('dragging')});
photos?.addEventListener('dragend',()=>{dragged?.classList.remove('dragging');dragged=null;renumber()});
photos?.addEventListener('dragover',e=>{e.preventDefault();const target=e.target.closest('.demo-photo');if(target&&dragged&&target!==dragged){const rect=target.getBoundingClientRect();const after=e.clientY>rect.top+rect.height/2;photos.insertBefore(dragged,after?target.nextSibling:target)}});
function renumber(){[...photos.children].forEach((photo,index)=>photo.querySelector('span').textContent=index+1)}

const toggle=document.querySelector('#publishToggle');
const status=document.querySelector('#publishStatus');
toggle?.addEventListener('change',()=>{status.textContent=toggle.checked?'公開中':'非公開'});
document.querySelector('.save-demo')?.addEventListener('click',e=>{const button=e.currentTarget;const original=button.textContent;button.textContent='保存済み ✓';setTimeout(()=>button.textContent=original,1600)});
document.querySelector('.add-photo')?.addEventListener('click',e=>{const button=e.currentTarget;button.textContent='写真フォルダを開く（デモ）';setTimeout(()=>button.textContent='＋ 写真を追加',1600)});

const imageConfirm=document.querySelector('#imageConfirm');
const replacePhotoButton=document.querySelector('.replace-photo-demo');
const imageExample=document.querySelector('.image-example');
replacePhotoButton?.addEventListener('click',()=>{imageConfirm.hidden=false;imageConfirm.querySelector('button')?.focus()});
imageConfirm?.addEventListener('click',e=>{
  const answer=e.target.closest('[data-image-answer]');
  if(!answer)return;
  const isWork=answer.dataset.imageAnswer==='work';
  imageExample?.classList.toggle('confirmed-work',isWork);
  imageExample?.querySelector('.image-note')?.toggleAttribute('hidden',isWork);
  imageConfirm.hidden=true;
  replacePhotoButton.textContent=isWork?'実績写真として確認済み ✓':'施工イメージとして確認済み ✓';
  replacePhotoButton.focus();
});

const modal=document.querySelector('#templateModal');
const modalImage=modal?.querySelector('img');
const modalPlaceholder='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
let lastTemplateButton=null;
document.querySelectorAll('.template-open').forEach(button=>button.addEventListener('click',()=>{
  lastTemplateButton=button;
  modalImage.src=button.dataset.full;
  modalImage.alt=button.querySelector('img').alt;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  modal.removeAttribute('inert');
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close').focus();
}));
function closeModal(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');modal?.setAttribute('inert','');document.body.classList.remove('modal-open');if(modalImage)modalImage.src=modalPlaceholder;lastTemplateButton?.focus()}
modal?.querySelector('.modal-close').addEventListener('click',closeModal);
modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))closeModal()});
