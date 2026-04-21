(() => {
  const $ = (id) => document.getElementById(id);

  // Quick, editable estimator rules (ranges are in USD)
  const ISSUE_BASE = {
    virus:   { low: 45,  high: 90,  eta: 'Same day–24h', label: 'Virus / Malware removal' },
    slow:    { low: 35,  high: 85,  eta: '24–48h',       label: 'Performance tune-up' },
    noboot:  { low: 55,  high: 140, eta: '24–72h',       label: 'No boot / startup issue' },
    screen:  { low: 70,  high: 220, eta: '2–5 days',     label: 'Screen / display issue' },
    data:    { low: 80,  high: 260, eta: '2–7 days',     label: 'Data recovery' },
    network: { low: 35,  high: 95,  eta: 'Same day–48h', label: 'Network / Wi‑Fi troubleshooting' },
    setup:   { low: 35,  high: 110, eta: 'Same day–48h', label: 'New device setup' },
    website: { low: 150, high: 900, eta: '3–14 days',    label: 'Website development (starter range)' },
    invitation:{low: 35, high: 180, eta: '1–5 days',     label: 'Online invitation (starter range)' },
    other:   { low: 40,  high: 160, eta: 'Varies',       label: 'General troubleshooting' },
  };

  const DEVICE_MULT = {
    laptop: 1.0,
    desktop: 1.0,
    mac: 1.15,
    phone: 1.1,
    tablet: 1.1,
    other: 1.05
  };

  const URGENCY_MULT = {
    standard: 1.0,
    priority: 1.25,
    emergency: 1.45
  };

  const MODE_ADD = {
    dropoff: { low: 0, high: 0, label: 'Drop-off service' },
    home:    { low: 15, high: 45, label: 'Home visit' },
    remote:  { low: -10, high: -10, label: 'Remote support' }
  };

  const ADDONS = [
    { id: 'addonBackup', low: 20, high: 60, label: 'Backup setup' },
    { id: 'addonCleanup', low: 15, high: 45, label: 'Deep cleaning / tune-up' },
    { id: 'addonInstall', low: 10, high: 35, label: 'Software install' },
    { id: 'addonExplain', low: 10, high: 25, label: 'Walkthrough / training' },
  ];

  function money(n){
    // Round to nearest 5 to feel more realistic
    const rounded = Math.round(n / 5) * 5;
    return `$${rounded}`;
  }

  function clampMinMax(low, high){
    const lo = Math.max(0, low);
    const hi = Math.max(lo, high);
    return { low: lo, high: hi };
  }

  function buildSummary(parts){
    return parts.filter(Boolean).join('\n');
  }

  function getState(){
    return {
      device: $('deviceType').value,
      issue: $('issueType').value,
      urgency: $('urgency').value,
      mode: $('serviceMode').value,
      details: ($('details').value || '').trim(),
      addons: ADDONS.filter(a => $(a.id).checked).map(a => a.label)
    };
  }

  function computeEstimate(){
    const state = getState();
    const base = ISSUE_BASE[state.issue] || ISSUE_BASE.other;
    const mult = (DEVICE_MULT[state.device] || 1.0) * (URGENCY_MULT[state.urgency] || 1.0);
    const mode = MODE_ADD[state.mode] || MODE_ADD.dropoff;

    let low = base.low * mult + mode.low;
    let high = base.high * mult + mode.high;

    const addonLines = [];
    ADDONS.forEach(a => {
      if ($(a.id).checked){
        low += a.low;
        high += a.high;
        addonLines.push(`• Add-on: ${a.label}`);
      }
    });

    const { low: lo, high: hi } = clampMinMax(low, high);

    const urgencyLabel = {
      standard: 'Standard',
      priority: 'Priority',
      emergency: 'Emergency'
    }[state.urgency] || 'Standard';

    const deviceLabel = {
      laptop: 'Laptop',
      desktop: 'Desktop',
      mac: 'Mac',
      phone: 'Phone',
      tablet: 'Tablet',
      other: 'Other'
    }[state.device] || 'Device';

    const modeLabel = {
      dropoff: 'Drop-off',
      home: 'Home visit',
      remote: 'Remote'
    }[state.mode] || 'Drop-off';

    const summaryParts = [
      `Device: ${deviceLabel}`,
      `Issue: ${base.label}`,
      `Service: ${modeLabel}`,
      `Urgency: ${urgencyLabel}`,
      addonLines.length ? addonLines.join('\n') : null,
      state.details ? `Details: ${state.details}` : null,
      '',
      `Estimated range: ${money(lo)} – ${money(hi)}`,
      `ETA: ${base.eta} (may vary with diagnosis/parts)`
    ];

    return {
      low: lo,
      high: hi,
      eta: base.eta,
      summaryText: buildSummary(summaryParts),
      issueValueForBooking: state.issue
    };
  }

  function render(){
    const est = computeEstimate();
    $('quoteRange').textContent = `${money(est.low)} – ${money(est.high)}`;
    $('quoteEta').textContent = `ETA: ${est.eta}`;
    $('quoteSummary').textContent = est.summaryText;
    return est;
  }

  async function copySummary(text){
    try{
      await navigator.clipboard.writeText(text);
      toast('Copied to clipboard.');
    }catch{
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast('Copied to clipboard.');
    }
  }

  function toast(msg){
    const el = document.createElement('div');
    el.className = 'chipit-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 250); }, 1800);
  }

  function sendToBooking(est){
    localStorage.setItem('chipit_prefill_service', est.issueValueForBooking || 'diagnosis');
    localStorage.setItem('chipit_prefill_notes', est.summaryText);
    window.location.href = 'booking.html';
  }

  function bind(){
    const inputs = ['deviceType','issueType','urgency','serviceMode','addonBackup','addonCleanup','addonInstall','addonExplain','details'];
    inputs.forEach(id => {
      const el = $(id);
      if(!el) return;
      const evt = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
      el.addEventListener(evt, () => render());
    });

    $('btnUpdateQuote').addEventListener('click', () => render());
    $('btnCopyQuote').addEventListener('click', () => {
      const est = render();
      copySummary(est.summaryText);
    });
    $('btnSendToBooking').addEventListener('click', () => {
      const est = render();
      sendToBooking(est);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // initial estimate
    render();
    bind();
  });
})();
