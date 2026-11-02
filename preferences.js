// Застосовуємо тему до першого відображення сторінки.
(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  let choice = read('forma-theme');
  const savedLanguage = read('forma-language');
  const urlLanguage = new URLSearchParams(location.search).get('lang');
  root.dataset.language = ['uk', 'en'].includes(urlLanguage) ? urlLanguage : savedLanguage === 'en' ? 'en' : 'uk';
  root.lang = root.dataset.language;
  function apply(theme) {
    root.dataset.theme = theme;
    const button = document.querySelector('#theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
      button.title = button.getAttribute('aria-label');
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14231d' : '#203D32');
  }
  apply(['light', 'dark'].includes(choice) ? choice : system.matches ? 'dark' : 'light');
  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.querySelector('#theme-toggle').addEventListener('click', () => {
      choice = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('forma-theme', choice); } catch { /* Працює й без сховища. */ }
      apply(choice);
    });
  });
  system.addEventListener('change', () => { if (!['light', 'dark'].includes(choice)) apply(system.matches ? 'dark' : 'light'); });
})();
