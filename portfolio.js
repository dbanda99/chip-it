(() => {
  const grid = document.getElementById('workGrid');
  const search = document.getElementById('workSearch');
  const filterBtns = Array.from(document.querySelectorAll('[data-filter]'));

  const WORK = [
    {
      id: 'w1',
      title: 'Laptop performance rescue',
      cat: 'performance',
      tag: 'Performance',
      imageWebp: 'images/optimized/cleaning_01-960.webp',
      imageJpg: 'images/optimized/cleaning_01-960.jpg',
      meta: '24–48 hours • Deep clean + startup optimization',
      results: '• Boot time: improved\n• Temps: reduced\n• System felt “like new”',
      keywords: 'laptop slow overheating cleaning tune-up'
    },
    {
      id: 'w2',
      title: 'Data backup & recovery setup',
      cat: 'data',
      tag: 'Data',
      imageWebp: 'images/optimized/backup_01-960.webp',
      imageJpg: 'images/optimized/backup_01-960.jpg',
      meta: '2–5 days • Recovery + backup plan',
      results: '• Critical files recovered\n• Automatic backups configured\n• Prevention tips provided',
      keywords: 'data recovery backup external drive files'
    },
    {
      id: 'w3',
      title: 'No-boot desktop diagnosis',
      cat: 'repair',
      tag: 'Repair',
      imageWebp: 'images/optimized/complete_01-960.webp',
      imageJpg: 'images/optimized/complete_01-960.jpg',
      meta: '24–72 hours • Startup repair + OS fixes',
      results: '• System restored\n• Updates stabilized\n• Clean startup verified',
      keywords: 'desktop wont boot repair startup windows'
    },
    {
      id: 'w4',
      title: 'Wi‑Fi reliability fix',
      cat: 'network',
      tag: 'Network',
      imageWebp: 'images/optimized/complete_01-960.webp',
      imageJpg: 'images/optimized/complete_01-960.jpg',
      meta: 'Same day–48 hours • Router + device troubleshooting',
      results: '• Stronger signal\n• Fewer dropouts\n• Better coverage planning',
      keywords: 'wifi network router internet slow connection'
    },
    {
      id: 'w5',
      title: 'Virus / malware removal',
      cat: 'repair',
      tag: 'Repair',
      imageWebp: 'images/optimized/cleaning_01-960.webp',
      imageJpg: 'images/optimized/cleaning_01-960.jpg',
      meta: 'Same day–24 hours • Cleanup + protection',
      results: '• Threats removed\n• Browser restored\n• Protection recommendations',
      keywords: 'virus malware spyware adware cleanup'
    },
    {
      id: 'w6',
      title: 'Custom website launch',
      cat: 'web',
      tag: 'Web',
      imageWebp: 'images/optimized/custom-img-900.webp',
      imageJpg: 'images/optimized/custom-img-900.jpg',
      meta: '3–10 days • Mobile-first + modern UI',
      results: '• Professional landing page\n• Fast image loading\n• Clear calls-to-action',
      keywords: 'website landing page business professional'
    },
    {
      id: 'w7',
      title: 'Premium invitation experience',
      cat: 'web',
      tag: 'Web',
      imageWebp: 'images/optimized/premium-img-900.webp',
      imageJpg: 'images/optimized/premium-img-900.jpg',
      meta: '1–5 days • Invitation + RSVP flow',
      results: '• Mobile-optimized\n• Easy edits\n• RSVP-ready layout',
      keywords: 'invitation wedding online rsvp'
    },
    {
      id: 'w8',
      title: 'Personal device setup + training',
      cat: 'performance',
      tag: 'Performance',
      imageWebp: 'images/optimized/testi_03-600.webp',
      imageJpg: 'images/optimized/testi_03-600.jpg',
      meta: 'Same day • Setup + walkthrough',
      results: '• Accounts set up\n• Updates installed\n• Quick how-to session',
      keywords: 'setup new device training help'
    }
  ];

  function catBadge(cat){
    const map = { repair: 'bg-primary', performance: 'bg-success', data: 'bg-warning text-dark', network: 'bg-info text-dark', web: 'bg-dark' };
    return map[cat] || 'bg-secondary';
  }

  function renderCard(item){
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.dataset.cat = item.cat;

    col.innerHTML = `
      <div class="card h-100 work-card reveal">
        <picture>
          <source type="image/webp" srcset="${item.imageWebp}" />
          <img src="${item.imageJpg}" alt="${item.title}" loading="lazy" decoding="async" />
        </picture>
        <div class="card-body d-flex flex-column">
          <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
            <h3 class="h5 fw-bold mb-0">${item.title}</h3>
            <span class="badge ${catBadge(item.cat)}">${item.tag}</span>
          </div>
          <div class="work-meta mb-2">${item.meta}</div>
          <div class="work-results text-muted small mb-3">${item.results}</div>

          <div class="mt-auto d-flex gap-2 flex-wrap">
            <button type="button" class="btn btn-sm btn-outline-primary" data-action="request" data-id="${item.id}">
              Request similar
            </button>
            <a class="btn btn-sm btn-primary" href="booking.html">Book</a>
          </div>
        </div>
      </div>
    `;
    return col;
  }

  function applyFilters(){
    const active = (filterBtns.find(b => b.classList.contains('active')) || {}).dataset.filter || 'all';
    const q = (search.value || '').trim().toLowerCase();

    const items = WORK.filter(w => {
      const filterOk = active === 'all' || w.cat === active;
      const searchOk = !q || (w.title + ' ' + w.meta + ' ' + w.keywords).toLowerCase().includes(q);
      return filterOk && searchOk;
    });

    grid.innerHTML = '';
    items.forEach(i => grid.appendChild(renderCard(i)));

    // Trigger reveal on newly inserted elements
    document.dispatchEvent(new Event('chipit:reveal:refresh'));
  }

  function setActive(btn){
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function attach(){
    filterBtns.forEach(btn => btn.addEventListener('click', () => { setActive(btn); applyFilters(); }));
    search.addEventListener('input', () => applyFilters());

    grid.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action="request"]');
      if (!target) return;
      const id = target.getAttribute('data-id');
      const item = WORK.find(w => w.id === id);
      if (!item) return;

      const summary = [
        `Request similar service — Chip-IT`,
        ``,
        `Reference: ${item.title}`,
        `Category: ${item.tag}`,
        `Expected timeline: ${item.meta}`,
        ``,
        `Please describe your device + issue.`
      ].join('\n');

      localStorage.setItem('chipit_prefill_service', 'diagnosis');
      localStorage.setItem('chipit_prefill_notes', summary);
      window.location.href = 'booking.html';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    attach();
    applyFilters();
  });
})();
