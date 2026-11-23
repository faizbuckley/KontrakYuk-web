// KontrakYuk · shared interactions and motion helpers
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // toast: one short confirmation at the foot of the screen
  let toastEl, toastTimer;
  function toast(text, icon = 'check_circle') {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'ky-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = `<span class="icon" aria-hidden="true">${icon}</span><span></span>`;
    toastEl.lastChild.textContent = text;
    requestAnimationFrame(() => toastEl.classList.add('is-on'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2400);
  }

  // roll a number in an element to a new value ("Rp 650.000", "3 Unit")
  function roll(el, text) {
    if (!el || el.textContent === text) return;
    el.textContent = text;
    if (reduce.matches) return;
    el.classList.remove('ky-tick');
    void el.offsetWidth;
    el.classList.add('ky-tick');
  }

  // play the enter animation on elements that just became visible
  function enter(els) {
    if (reduce.matches) return;
    els.forEach((el, i) => {
      el.classList.remove('ky-enter');
      void el.offsetWidth;
      el.style.animationDelay = Math.min(i * 40, 160) + 'ms';
      el.classList.add('ky-enter');
    });
  }

  window.KY = { toast, roll, enter, reduce };

  // account menu: opens from the avatar, closes on outside click or Escape
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.account__btn');
    document.querySelectorAll('.account__btn[aria-expanded="true"]').forEach((b) => {
      if (b !== btn && !e.target.closest('.account__menu')) { b.setAttribute('aria-expanded', 'false'); document.getElementById(b.getAttribute('aria-controls')).hidden = true; }
    });
    if (!btn) return;
    const menu = document.getElementById(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const b = document.querySelector('.account__btn[aria-expanded="true"]');
    if (b) { b.setAttribute('aria-expanded', 'false'); document.getElementById(b.getAttribute('aria-controls')).hidden = true; b.focus(); }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.account__btn')) return;
    const t = e.target.closest('button, [role="tab"], a[data-toast]');
    if (!t) return;

    if (t.classList.contains('menu-toggle')) {
      const header = t.closest('.site-header');
      const open = header.classList.toggle('is-open');
      t.setAttribute('aria-expanded', String(open));
      return;
    }

    // a button that flips to a done state once, with its own label
    if (t.dataset.doneLabel && t.dataset.done !== 'true') {
      t.dataset.done = 'true';
      t.innerHTML = `<span class="icon" aria-hidden="true">${t.dataset.doneIcon || 'check_circle'}</span>${t.dataset.doneLabel}`;
      if (t.dataset.toast) toast(t.dataset.toast);
      return;
    }

    if (t.hasAttribute('aria-pressed')) {
      const on = t.getAttribute('aria-pressed') !== 'true';
      t.setAttribute('aria-pressed', String(on));
      const msg = on ? t.dataset.toastOn : t.dataset.toastOff;
      if (msg) toast(msg, on ? 'check_circle' : 'info');
      return;
    }

    if (t.getAttribute('role') === 'switch') {
      t.setAttribute('aria-checked', String(t.getAttribute('aria-checked') !== 'true'));
      return;
    }

    if (t.getAttribute('role') === 'tab') {
      const list = t.closest('[role="tablist"]');
      list.querySelectorAll('[role="tab"]').forEach((b) => b.setAttribute('aria-selected', String(b === t)));
      const area = t.dataset.area;
      if (area) {
        const shown = [];
        document.querySelectorAll('.listing[data-area]').forEach((card) => {
          card.hidden = area !== 'all' && card.dataset.area !== area;
          if (!card.hidden) shown.push(card);
        });
        enter(shown);
      }
      const group = t.dataset.group;
      if (group) {
        const shown = [];
        document.querySelectorAll('[data-group-item]').forEach((el) => {
          el.hidden = group !== 'all' && !el.dataset.groupItem.split(' ').includes(group);
          if (!el.hidden) shown.push(el);
        });
        enter(shown);
      }
      return;
    }

    if (t.dataset.choice) {
      const set = t.dataset.choice;
      document.querySelectorAll(`[data-choice="${set}"]`).forEach((b) => b.setAttribute('aria-checked', String(b === t)));
      document.dispatchEvent(new CustomEvent('ky:choice', { detail: { set, value: t.dataset.value, el: t } }));
      return;
    }

    if (t.dataset.toast) {
      if (t.tagName === 'A' && t.getAttribute('href') === '#') e.preventDefault();
      toast(t.dataset.toast, t.dataset.toastIcon || 'check_circle');
    }
  });
})();
