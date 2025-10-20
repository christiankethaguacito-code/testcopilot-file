// Main script for portfolio interactions

// Helpers for focus trap
function trapFocus(container) {
  const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';
  const nodes = Array.from(container.querySelectorAll(focusableSelectors)).filter(n => n.getAttribute('tabindex') !== '-1');
  if (!nodes.length) return () => {};
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  function handle(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  document.addEventListener('keydown', handle);
  return () => document.removeEventListener('keydown', handle);
}

// DOM-ready initializations
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle (safe guards)
  const themeToggle = document.getElementById('themeToggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');
  function setTheme(theme){ if(theme==='dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); localStorage.setItem('theme', theme); if(iconSun) iconSun.classList.toggle('hidden', theme!=='light'); if(iconMoon) iconMoon.classList.toggle('hidden', theme==='light'); }
  const saved = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); setTheme(saved);
  themeToggle && themeToggle.addEventListener('click', ()=> setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark'));

  // Year
  const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu open/close with scrim and focus trap
  const mobileButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileMenuClose');
  const mobileScrim = document.getElementById('mobileScrim');
  let releaseMobileTrap = null;
  function openMobileMenu(){ mobileMenu.classList.add('open'); mobileScrim.classList.add('open'); mobileMenu.setAttribute('aria-hidden','false'); mobileButton && mobileButton.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; releaseMobileTrap = trapFocus(mobileMenu); mobileMenu.querySelector('a,button, [tabindex]')?.focus(); }
  function closeMobileMenu(){ mobileMenu.classList.remove('open'); mobileScrim.classList.remove('open'); mobileMenu.setAttribute('aria-hidden','true'); mobileButton && mobileButton.setAttribute('aria-expanded','false'); document.body.style.overflow=''; if(releaseMobileTrap) { releaseMobileTrap(); releaseMobileTrap = null; } mobileButton?.focus(); }
  mobileButton && mobileButton.addEventListener('click', openMobileMenu);
  mobileClose && mobileClose.addEventListener('click', closeMobileMenu);
  mobileScrim && mobileScrim.addEventListener('click', closeMobileMenu);

  // Modal handling + focus trap
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  let releaseModalTrap = null;
  function openModal(){ modal.classList.remove('hidden'); modal.classList.add('flex'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; releaseModalTrap = trapFocus(modal); modalClose?.focus(); }
  function closeModal(){ modal.classList.add('hidden'); modal.classList.remove('flex'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; if(releaseModalTrap){ releaseModalTrap(); releaseModalTrap = null; } }
  modalClose && modalClose.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

  // Close on Escape
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ if(mobileMenu.classList.contains('open')) closeMobileMenu(); if(!modal.classList.contains('hidden')) closeModal(); } });

  // Project filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectsGrid = document.getElementById('projectsGrid');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.project-card').forEach(card => {
      const tags = card.getAttribute('data-tags') || '';
      if (filter === '*' || tags.split(' ').includes(filter)) card.style.display = '';
      else card.style.display = 'none';
    });
    filterBtns.forEach(b=>b.classList.remove('bg-slate-100','dark:bg-slate-800'));
    btn.classList.add('bg-slate-100');
  }));

  // View project details (modal)
  document.querySelectorAll('.view-btn').forEach((b)=>{
    b.addEventListener('click', (e)=>{
      const card = e.target.closest('.project-card');
      const title = card.querySelector('h3').textContent;
      const desc = card.querySelector('p').textContent;
      const img = card.querySelector('img')?.src || '';
      modalContent.innerHTML = `<div class=\"space-y-4\">${img?`<img src=\"${img}\" class=\"w-full rounded-md object-cover\" alt=\"${title}\" />`:''}<h3 class=\"text-xl font-semibold\">${title}</h3><p class=\"text-slate-600 dark:text-slate-300\">${desc}</p><p class=\"text-sm text-slate-500\">Role: Design & Frontend</p></div>`;
      openModal();
    });
  });

  // Load more (simulated)
  const loadMoreBtn = document.getElementById('loadMore');
  if(loadMoreBtn){ loadMoreBtn.addEventListener('click', ()=>{
     const moreHTML = `\n      <article class="project-card p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition animate-fade-in" data-tags="web">\n        <div class="mb-3 rounded-md overflow-hidden"><img src="assets/images/project-alpha.svg" alt="New Project" class="w-full h-40 object-cover" loading="lazy" /></div>\n        <h3 class="font-semibold">New Project</h3>\n        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">A freshly loaded project card.</p>\n        <div class="mt-4 flex items-center justify-between"><div class="text-xs text-slate-400">Web</div><button class="view-btn inline-flex items-center gap-2 text-indigo-600 text-sm">View</button></div>\n      </article>`;
    projectsGrid.insertAdjacentHTML('beforeend', moreHTML);
    // rebind view buttons
    document.querySelectorAll('.view-btn').forEach(btn=>{ btn.removeEventListener('click', ()=>{}); btn.addEventListener('click', (e)=>{ const card = e.target.closest('.project-card'); const title = card.querySelector('h3').textContent; const desc = card.querySelector('p').textContent; const img = card.querySelector('img')?.src || ''; modalContent.innerHTML = `<div class=\\"space-y-4\\">${img?`<img src=\\"${img}\\" class=\\"w-full rounded-md object-cover\\" alt=\\"${title}\\" />`:''}<h3 class=\\"text-xl font-semibold\\">${title}</h3><p class=\\"text-slate-600 dark:text-slate-300\\">${desc}</p><p class=\\"text-sm text-slate-500\\">Role: Frontend</p></div>`; openModal(); }); });
  }); }

  // Contact form (simulated) - keep method POST action configurable for Formspree
  const contactForm = document.getElementById('contactForm');
  if(contactForm){ contactForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const status = document.getElementById('contactStatus');
    if(!name || !email || !message){ status.textContent = 'Please fill all fields.'; return; }
    status.textContent = 'Sending...';
    await new Promise(r=>setTimeout(r,700));
    status.textContent = 'Thanks! I will get back to you soon.';
    e.target.reset();
  }); }

  // Quote (fetch)
  const quoteBtn = document.getElementById('quoteBtn');
  if(quoteBtn){ quoteBtn.addEventListener('click', async ()=>{
    const qEl = document.getElementById('quote'); qEl.textContent='Loading...';
    try{ const res = await fetch('https://api.quotable.io/random'); if(!res.ok) throw new Error('Network'); const data = await res.json(); qEl.innerHTML = `<em>\"${data.content}\"</em><div class=\\"mt-2 text-xs text-slate-400\\">— ${data.author}</div>`; }catch(e){ qEl.textContent = 'Could not load quote.'; }
  }); }

  // stagger animation delays
  document.querySelectorAll('.animate-fade-in').forEach((el,i)=>el.style.setProperty('--delay', `${i*60}ms`));
});
