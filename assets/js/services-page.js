(() => {
  function normalize(s) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('serviceSearch');
    const clearBtn = document.getElementById('serviceSearchClear');
    const countEl = document.getElementById('serviceSearchCount');

    const cards = Array.from(document.querySelectorAll('[data-service-card]'));

    if (!input || !cards.length) return;

    const apply = () => {
      const q = normalize(input.value);
      let visible = 0;

      cards.forEach((card) => {
        const hay = normalize(card.getAttribute('data-search') || card.textContent);
        const match = !q || hay.includes(q);
        const gridItem = card.closest('[class*="col-"]') || card;
        gridItem.style.display = match ? '' : 'none';
        if (match) visible += 1;
      });

      if (countEl) countEl.textContent = `${visible} service${visible === 1 ? '' : 's'} shown`;
      if (clearBtn) clearBtn.style.display = input.value ? 'inline-flex' : 'none';
    };

    input.addEventListener('input', apply);
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        input.focus();
        apply();
      });
    }

    apply();
  });
})();
