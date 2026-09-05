const GA4_EVENT_NAMES=new Set(['click_line','click_contact','click_plan','click_portfolio']);
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
  window.gtag('event',eventName,{
    link_url:target.href||undefined,
    link_text:target.textContent.trim().replace(/\s+/g,' '),
    placement:target.dataset.gaLabel||undefined,
  });
});

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

const modal=document.querySelector('#templateModal');
const modalImage=modal?.querySelector('img');
let lastTemplateButton=null;
document.querySelectorAll('.template-open').forEach(button=>button.addEventListener('click',()=>{
  lastTemplateButton=button;
  modalImage.src=button.dataset.full;
  modalImage.alt=button.querySelector('img').alt;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close').focus();
}));
function closeModal(){modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(modalImage)modalImage.src='';lastTemplateButton?.focus()}
modal?.querySelector('.modal-close').addEventListener('click',closeModal);
modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))closeModal()});
