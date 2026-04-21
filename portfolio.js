(() => {
  const grid = document.getElementById('workGrid');
  const search = document.getElementById('workSearch');
  const count = document.getElementById('workCount');
  const filterBtns = Array.from(document.querySelectorAll('[data-filter]'));

  const WORK = [
    {
      id: 'w1',
      title: 'Laptop performance rescue',
      cat: 'performance',
      tag: 'Performance',
      imageWebp: 'images/optimized/cleaning_01-960.webp',
      imageJpg: 'images/optimized/cleaning_01-960.jpg',
      meta: '24-48 hours | Deep clean + startup optimization',
      results: ['Boot time improved', 'Temperatures reduced', 'System felt like new'],
      keywords: 'laptop slow overheating cleaning tune-up'
    },
    {
      id: 'w2',
      title: 'Data backup and recovery setup',
      cat: 'data',
      tag: 'Data',
      imageWebp: 'images/optimized/backup_01-960.webp',
      imageJpg: 'images/optimized/backup_01-960.jpg',
      meta: '2-5 days | Recovery + backup plan',
      results: ['Critical files recovered', 'Automatic backups configured', 'Prevention tips provided'],
      keywords: 'data recovery backup external drive files'
    },
    {
      id: 'w3',
      title: 'No-boot desktop diagnosis',
      cat: 'repair',
      tag: 'Repair',
      imageWebp: 'images/optimized/complete_01-960.webp',
      imageJpg: 'images/optimized/complete_01-960.jpg',
      meta: '24-72 hours | Startup repair + OS fixes',
      results: ['System restored', 'Updates stabilized', 'Clean startup verified'],
      keywords: 'desktop wont boot repair startup windows'
    },
    {
      id: 'w4',
      title: 'Wi-Fi reliability fix',
      cat: 'network',
      tag: 'Network',
      imageWebp: 'images/optimized/complete_01-960.webp',
      imageJpg: 'images/optimized/complete_01-960.jpg',
      meta: 'Same day-48 hours | Router + device troubleshooting',
      results: ['Stronger signal', 'Fewer dropouts', 'Better coverage planning'],
      keywords: 'wifi network router internet slow connection'
    },
    {
      id: 'w5',
      title: 'Virus and malware removal',
      cat: 'repair',
      tag: 'Repair',
      imageWebp: 'images/optimized/cleaning_01-960.webp',
      imageJpg: 'images/optimized/cleaning_01-960.jpg',
      meta: 'Same day-24 hours | Cleanup + protection',
      results: ['Threats removed', 'Browser restored', 'Protection recommendations'],
      keywords: 'virus malware spyware adware cleanup'
    },
    {
      id: 'w6',
      title: 'Custom website launch',
      cat: 'web',
      tag: 'Web',
      imageWebp: 'images/optimized/custom-img-900.webp',
      imageJpg: 'images/optimized/custom-img-900.jpg',
      meta: '3-10 days | Mobile-first + modern UI',
      results: ['Professional landing page', 'Fast image loading', 'Clear calls to action'],
      keywords: 'website landing page business professional'
    },
    {
      id: 'w7',
      title: 'Premium invitation experience',
      cat: 'web',
      tag: 'Web',
      imageWebp: 'images/optimized/premium-img-900.webp',
      imageJpg: 'images/optimized/premium-img-900.jpg',
      meta: '1-5 days | Invitation + RSVP flow',
      results: ['Mobile-optimized layout', 'Easy edits', 'RSVP-ready structure'],
      keywords: 'invitation wedding online rsvp'
    },
    {
      id: 'w8',
      title: 'Personal device setup and training',
      cat: 'performance',
      tag: 'Performance',
      imageWebp: 'images/optimized/testi_03-600.webp',
      imageJpg: 'images/optimized/testi_03-600.jpg',
      meta: 'Same day | Setup + walkthrough',
      results: ['Accounts set up', 'Updates installed', 'Quick how-to session'],
      keywords: 'setup new device training help'
    }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function tagClass(cat) {
    return `tag-${cat || 'default'}`;
  }

  function renderResults(results) {
    return results.map((result) => `
      <li><i class="bi bi-check-circle-fill" aria-hidden="true"></i><span>${escapeHtml(result)}</span></li>
    `).join('');
  }

  function renderCard(item) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-xl-4 d-flex';
    col.dataset.cat = item.cat;

    col.innerHTML = `
      <article class="work-card reveal">
        <picture class="work-card__media">
          <source type="image/webp" srcset="${escapeHtml(item.imageWebp)}" />
          <img src="${escapeHtml(item.imageJpg)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" />
          <span class="work-card__tag ${tagClass(item.cat)}">${escapeHtml(item.tag)}</span>
        </picture>
        <div class="work-card__body">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="work-meta"><i class="bi bi-clock-history" aria-hidden="true"></i><span>${escapeHtml(item.meta)}</span></div>
          <ul class="work-results">${renderResults(item.results)}</ul>

          <div class="work-actions">
            <button type="button" class="btn btn-outline-primary" data-action="request" data-id="${escapeHtml(item.id)}">
              Request similar
            </button>
            <a class="btn btn-primary" href="booking.html">Book</a>
          </div>
        </div>
      </article>
    `;
    return col;
  }

  function renderEmptyState() {
    const col = document.createElement('div');
    col.className = 'col-12';
    col.innerHTML = `
      <div class="empty-state reveal">
        <h3>No matching work found</h3>
        <p class="mb-0">No projects match this view right now.</p>
      </div>
    `;
    return col;
  }

  function setCount(total) {
    if (!count) return;
    count.textContent = `${total} ${total === 1 ? 'result' : 'results'}`;
  }

  function applyFilters() {
    const activeBtn = filterBtns.find((button) => button.classList.contains('active'));
    const active = (activeBtn && activeBtn.dataset.filter) || 'all';
    const q = (search.value || '').trim().toLowerCase();

    const items = WORK.filter((work) => {
      const filterOk = active === 'all' || work.cat === active;
      const searchText = `${work.title} ${work.meta} ${work.tag} ${work.keywords} ${work.results.join(' ')}`;
      const searchOk = !q || searchText.toLowerCase().includes(q);
      return filterOk && searchOk;
    });

    grid.innerHTML = '';
    if (items.length) {
      items.forEach((item) => grid.appendChild(renderCard(item)));
    } else {
      grid.appendChild(renderEmptyState());
    }

    setCount(items.length);
    document.dispatchEvent(new Event('chipit:reveal:refresh'));
  }

  function setActive(btn) {
    filterBtns.forEach((button) => {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  }

  function attach() {
    filterBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
      btn.addEventListener('click', () => {
        setActive(btn);
        applyFilters();
      });
    });

    if (search) {
      search.addEventListener('input', () => applyFilters());
    }

    grid.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action="request"]');
      if (!target) return;

      const item = WORK.find((work) => work.id === target.getAttribute('data-id'));
      if (!item) return;

      const summary = [
        'Request similar service - Chip-IT',
        '',
        `Reference: ${item.title}`,
        `Category: ${item.tag}`,
        `Expected timeline: ${item.meta}`,
        '',
        'Please describe your device and issue.'
      ].join('\n');

      localStorage.setItem('chipit_prefill_service', 'diagnosis');
      localStorage.setItem('chipit_prefill_notes', summary);
      window.location.href = 'booking.html';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!grid || !search) return;
    attach();
    applyFilters();
  });
})();
