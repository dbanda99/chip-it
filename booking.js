(() => {
  const $ = (id) => document.getElementById(id);
  const EMAIL_ENDPOINT = 'https://server-chipit.onrender.com/send-email';
  const SUBMIT_TIMEOUT_MS = 15000;

  function formatPhoneDigits(raw){
    let input = String(raw || '').replace(/\D/g, '').slice(0, 10);
    if (!input) return '';
    let out = '(' + input.substring(0, 3);
    if (input.length >= 4) out += ') - ' + input.substring(3, 6);
    if (input.length >= 7) out += ' - ' + input.substring(6, 10);
    return out;
  }

  function toTitle(s){
    return String(s || '').replace(/(^|\s)\S/g, (m) => m.toUpperCase()).trim();
  }

  function getState(){
    return {
      apptType: $('apptType').value,
      service: $('service').value,
      date: $('date').value,
      time: $('time').value,
      name: toTitle($('name').value),
      phone: $('phone').value,
      email: $('email').value,
      notes: ($('notes').value || '').trim()
    };
  }

  function validate(state){
    const required = ['date','time','name','phone','email'];
    for (const k of required){
      if (!state[k]) return { ok: false, msg: 'Please fill all required fields.' };
    }
    const phoneDigits = state.phone.replace(/\D/g,'');
    if (phoneDigits.length !== 10) return { ok: false, msg: 'Please enter a valid 10-digit phone number.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) return { ok: false, msg: 'Please enter a valid email.' };
    return { ok: true };
  }

  function labels(state){
    const appt = { dropoff: 'Drop-off', home: 'Home visit', remote: 'Remote support' }[state.apptType] || 'Drop-off';
    const svcMap = {
      diagnosis: 'Diagnosis / General troubleshooting',
      virus: 'Virus / Malware',
      performance: 'Slow / Overheating',
      network: 'Network / Wi-Fi',
      data: 'Data recovery',
      setup: 'New device setup',
      website: 'Website development',
      invitation: 'Online invitation'
    };
    const svc = svcMap[state.service] || 'Service';
    return { appt, svc };
  }

  function buildPreview(state){
    const { appt, svc } = labels(state);
    const lines = [
      `Booking request - Chip-IT`,
      ``,
      `Appointment type: ${appt}`,
      `Service: ${svc}`,
      `Preferred time: ${state.date} at ${state.time}`,
      ``,
      `Name: ${state.name}`,
      `Phone: ${state.phone}`,
      `Email: ${state.email}`,
      state.notes ? `` : null,
      state.notes ? `Notes: ${state.notes}` : null,
    ].filter(v => v !== null);

    return lines.join('\n');
  }

  function showPreview(){
    const state = getState();
    const v = validate(state);
    if (!v.ok){
      toast(v.msg);
      return null;
    }
    const preview = buildPreview(state);
    $('previewBox').textContent = preview;
    return { state, preview };
  }

  function buildICS(state){
    // Build an .ics file for the preferred slot (local time). This is a "request hold" for the user.
    const start = new Date(state.date + 'T' + state.time + ':00');
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour

    // format YYYYMMDDTHHMMSS
    const fmt = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return (
        d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        'T' +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        '00'
      );
    };

    const uid = 'chipit-' + Math.random().toString(16).slice(2) + '@chip-it';
    const { appt, svc } = labels(state);
    const summary = `Chip-IT: ${svc} (${appt})`;
    const desc = buildPreview(state);

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Chip-IT//Booking//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${escapeICS(summary)}`,
      `DESCRIPTION:${escapeICS(desc)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return ics;
  }

  function escapeICS(s){
    return String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  function downloadFile(filename, content, type){
    const blob = new Blob([content], { type: type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }

  function splitName(fullName){
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || 'Booking'
    };
  }

  function buildMailto(previewText){
    const subject = encodeURIComponent('Chip-IT booking request');
    const body = encodeURIComponent(previewText);
    return `mailto:?subject=${subject}&body=${body}`;
  }

  function warmEmailServer(){
    try {
      fetch(EMAIL_ENDPOINT, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        keepalive: true
      }).catch(() => {});
    } catch (e) {
      // Ignore warm-up failures.
    }
  }

  async function fetchWithTimeout(url, options, timeoutMs){
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function submitBooking(state, previewText){
    const names = splitName(state.name);
    const payload = {
      firstName: names.firstName,
      lastName: names.lastName,
      email: state.email,
      phone: state.phone,
      issue: state.service,
      comments: previewText
    };

    const btn = $('btnSend');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending request...';
    }

    try {
      const response = await fetchWithTimeout(EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, SUBMIT_TIMEOUT_MS);
      const data = await response.json().catch(() => ({}));
      if (!response.ok || (data.status && data.status !== 'Succeeded')) {
        throw new Error('Booking submission failed');
      }
      toast('Booking request submitted.');
    } catch (error) {
      window.location.href = buildMailto(previewText);
      toast('Server is taking too long. Opening your email app as a fallback.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
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

  function bind(){
    // Phone formatting
    $('phone').addEventListener('input', (e) => {
      e.target.value = formatPhoneDigits(e.target.value);
    });

    $('btnPreview').addEventListener('click', () => showPreview());

    $('btnAddToCalendar').addEventListener('click', () => {
      const out = showPreview();
      if (!out) return;
      const ics = buildICS(out.state);
      downloadFile('chip-it-booking.ics', ics, 'text/calendar');
      toast('Calendar file downloaded.');
    });

    $('btnSend').addEventListener('click', () => {
      const out = showPreview();
      if (!out) return;
      submitBooking(out.state, out.preview);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    warmEmailServer();

    try {
      const prefillService = localStorage.getItem('chipit_prefill_service');
      const prefillNotes = localStorage.getItem('chipit_prefill_notes');
      const serviceMap = {
        virus: 'virus',
        slow: 'performance',
        noboot: 'diagnosis',
        screen: 'diagnosis',
        data: 'data',
        network: 'network',
        setup: 'setup',
        website: 'website',
        invitation: 'invitation',
        other: 'diagnosis'
      };

      if (prefillService && $('service')) {
        $('service').value = serviceMap[prefillService] || prefillService;
      }

      if (prefillNotes && $('notes')) {
        $('notes').value = prefillNotes;
      }

      if (prefillService || prefillNotes) {
        localStorage.removeItem('chipit_prefill_service');
        localStorage.removeItem('chipit_prefill_notes');
      }
    } catch (e) {
      // Ignore storage errors.
    }

    // Set default date to tomorrow if empty
    const date = $('date');
    if (date && !date.value){
      const d = new Date();
      d.setDate(d.getDate() + 1);
      date.value = d.toISOString().slice(0,10);
    }
    bind();
  });
})();
