'use strict';
(() => {
  const dictionaries = window.KM_TRANSLATIONS;
  const supported = Object.keys(dictionaries);
  const params = new URLSearchParams(location.search);
  let stored;
  try { stored = localStorage.getItem('km-language'); } catch {}
  const preferred = (navigator.languages || [navigator.language || 'en']).map(l => l.split('-')[0]).find(l => supported.includes(l));
  let language = [params.get('lang'), stored, preferred, 'en'].find(l => supported.includes(l));
  function t(key, values = {}) {
    const message = dictionaries[language][key] || dictionaries.en[key] || key;
    return message.replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match));
  }
  function apply() {
    document.documentElement.lang = language;
    document.title = 'KumbhMitra · ' + t('Your way, together');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = (el.dataset.prefix || '') + t(el.dataset.i18n) + (el.dataset.suffix || '');
    });
    ['placeholder', 'title', 'aria-label'].forEach(attribute => {
      document.querySelectorAll('[data-i18n-' + attribute + ']').forEach(el => el.setAttribute(attribute, t(el.getAttribute('data-i18n-' + attribute))));
    });
    document.getElementById('language').value = language;
  }
  window.KM = {t, get language() { return language; }, apply};
  document.getElementById('language').addEventListener('change', event => {
    if (!supported.includes(event.target.value)) return;
    language = event.target.value;
    try { localStorage.setItem('km-language', language); } catch {}
    // A shared-link language must not override a new choice after reload.
    if (params.has('lang')) { const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url); }
    apply();
    document.dispatchEvent(new CustomEvent('km:languagechange'));
  });
  apply();
})();
