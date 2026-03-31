// js/app.js
export function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  // active link
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href')?.split('/').pop() === page) a.classList.add('active');
  });
  // hamburger
  const hb = document.querySelector('.hamburger');
  const nl = document.querySelector('.nav-links');
  if (hb && nl) hb.addEventListener('click', () => {
    const open = nl.dataset.open === '1';
    nl.dataset.open = open ? '0' : '1';
    if (open) { nl.removeAttribute('style'); }
    else Object.assign(nl.style, {display:'flex',flexDirection:'column',position:'fixed',top:'68px',left:'0',right:'0',background:'white',padding:'1.25rem 2rem 1.75rem',borderBottom:'1px solid #e2e8f0',boxShadow:'0 8px 24px rgba(0,0,0,.1)',zIndex:'899'});
  });
}

export function toast(msg, type='info') {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id='toast'; document.body.appendChild(el); }
  const c = {success:'#10b981',error:'#ef4444',warning:'#f59e0b',info:'#2563eb'};
  el.style.borderLeftColor = c[type] || c.info;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 3200);
}

export function initFade() {
  const els = document.querySelectorAll('[data-fade]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = parseInt(e.target.dataset.delay||0);
        setTimeout(() => e.target.classList.add('visible'), d);
        obs.unobserve(e.target);
      }
    });
  }, {threshold:.1});
  els.forEach(el => obs.observe(el));
}

export function animCount(el, target, dur=1400) {
  const t0 = performance.now();
  const run = now => {
    const p = Math.min((now-t0)/dur,1);
    el.textContent = Math.floor((1-Math.pow(1-p,3))*target);
    if (p<1) requestAnimationFrame(run); else el.textContent=target;
  };
  requestAnimationFrame(run);
}

export function checkAdminAuth() {
  if (sessionStorage.getItem('frg_admin')==='1') return true;
  const pwd = prompt('🔒 Mot de passe administrateur :');
  if (pwd === 'frigelis2025') { sessionStorage.setItem('frg_admin','1'); return true; }
  document.body.innerHTML=`<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;background:#f8fafc"><div style="text-align:center;color:#64748b"><div style="font-size:3rem;margin-bottom:1rem">🔒</div><p style="margin-bottom:1rem">Accès refusé.</p><a href="../index.html" style="color:#2563eb;font-weight:600">← Retour au site</a></div></div>`;
  return false;
}
