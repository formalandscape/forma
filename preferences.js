// Нове відкриття та оновлення починаються з головного екрана, навіть за старим #contact.
// Повернення кнопкою «Назад» зберігає стандартне відновлення позиції.
(() => {
  if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;
  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  const sectionHashes = ['#home', '#main', '#about', '#services', '#projects', '#comparison-section', '#process', '#area', '#estimate', '#contact'];
  if (sectionHashes.includes(location.hash)) history.replaceState(history.state, '', location.pathname + location.search);
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  let interacted = false;
  const listeners = new AbortController();
  for (const name of ['pointerdown', 'wheel', 'touchstart', 'keydown']) {
    window.addEventListener(name, () => { interacted = true; }, { passive: true, signal: listeners.signal });
  }
  window.addEventListener('pageshow', event => {
    // Не перебиваємо користувача, якщо він уже почав перегляд до повного завантаження.
    if (!event.persisted && !interacted) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    requestAnimationFrame(() => { history.scrollRestoration = previousRestoration; });
    listeners.abort();
  }, { once: true });
})();

// Застосовуємо збережену тему до першого відображення, без початкової анімації.
(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  let choice = read('forma-theme');
  let activeTransition;
  let fallbackTimer;
  const savedLanguage = read('forma-language');
  const urlLanguage = new URLSearchParams(location.search).get('lang');
  root.dataset.language = ['uk', 'en'].includes(urlLanguage) ? urlLanguage : savedLanguage === 'en' ? 'en' : 'uk';
  root.lang = root.dataset.language;
  function renderTheme(theme) {
    root.dataset.theme = theme;
    const button = document.querySelector('#theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
      button.title = button.getAttribute('aria-label');
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14231d' : '#203D32');
  }
  function apply(theme, animate = false) {
    activeTransition?.skipTransition();
    clearTimeout(fallbackTimer);
    if (!animate || reducedMotion.matches) {
      root.classList.remove('theme-color-transition'); renderTheme(theme); return;
    }
    if (typeof document.startViewTransition === 'function') {
      // Плавне GPU-змішування всієї палітри без постійного перемальовування довгої сторінки.
      const transition = document.startViewTransition(() => renderTheme(theme));
      activeTransition = transition;
      transition.finished.catch(() => {}).finally(() => {
        if (activeTransition === transition) activeTransition = null;
      });
    } else {
      // Звичайний колірний перехід у браузерах без View Transitions.
      root.classList.add('theme-color-transition');
      void root.offsetWidth;
      renderTheme(theme);
      fallbackTimer = setTimeout(() => root.classList.remove('theme-color-transition'), 1150);
    }
  }
  apply(['light', 'dark'].includes(choice) ? choice : system.matches ? 'dark' : 'light');
  document.addEventListener('DOMContentLoaded', () => {
    renderTheme(root.dataset.theme);
    document.querySelector('#theme-toggle').addEventListener('click', () => {
      const current = ['light', 'dark'].includes(choice) ? choice : root.dataset.theme;
      choice = current === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('forma-theme', choice); } catch { /* Працює й без сховища. */ }
      apply(choice, true);
    });
  });
  system.addEventListener('change', () => {
    if (!['light', 'dark'].includes(choice)) apply(system.matches ? 'dark' : 'light', document.readyState === 'complete');
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      activeTransition?.skipTransition(); clearTimeout(fallbackTimer); root.classList.remove('theme-color-transition');
    }
  });
})();
