import { english } from './translations.js?v=messengers-1';
const ukrainian = Object.fromEntries(Object.entries(english).map(([uk, en]) => [en, uk]));
let language = document.documentElement.dataset.language === 'en' ? 'en' : 'uk';
export function t(value, target = language) {
  if (typeof value !== 'string') return value;
  const dict = target === 'en' ? english : ukrainian;
  if (dict[value] !== undefined) return dict[value];
  const trimmed = value.trim();
  if (dict[trimmed] !== undefined) return value.replace(trimmed, dict[trimmed]);
  if (value.includes('\n')) return value.split('\n').map(line => t(line, target)).join('\n');
  if (value.includes(' · ')) return value.split(' · ').map(part => t(part, target)).join(' · ');
  const rules = [
    [/^Показано проєктів: (\d+)\.$/, /^Projects shown: (\d+)\.$/, n => `Projects shown: ${n}.`, n => `Показано проєктів: ${n}.`],
    [/^До: (\d+) відсотків, після: (\d+) відсотків$/, /^Before: (\d+) percent, after: (\d+) percent$/, (a,b) => `Before: ${a} percent, after: ${b} percent`, (a,b) => `До: ${a} відсотків, після: ${b} відсотків`]
  ];
  for (const [uk, en, toEn, toUk] of rules) {
    const match = value.match(target === 'en' ? uk : en);
    if (match) return (target === 'en' ? toEn : toUk)(...match.slice(1));
  }
  const prefixes = [
    ['Збільшити фото: ', 'Enlarge photo: '], ['Скопіювати номер телефону ', 'Copy phone number '],
    ['Скопіювати пошту ', 'Copy email address '], ['Мене звати ', 'My name is '],
    ['Телефон: ', 'Phone: '], ['Розташування: ', 'Location: '], ['Напрям: ', 'Service: '],
    ['Площа ділянки: ', 'Plot area: '], ['Стан ділянки: ', 'Site condition: '], ['Площа: ', 'Area: ']
  ];
  for (const [uk, en] of prefixes) {
    const source = target === 'en' ? uk : en;
    if (value.startsWith(source)) return (target === 'en' ? en : uk) + t(value.slice(source.length), target).replace(target === 'en' ? / м²$/ : / m²$/, target === 'en' ? ' m²' : ' м²');
  }
  return value;
}

// Зберігаємо оригінали окремих текстових вузлів і атрибутів: розмітка та введені дані не замінюються.
const originals = new WeakMap();
const attributes = ['aria-label', 'aria-valuetext', 'placeholder', 'title', 'alt'];
function renderValue(node, key, current, write) {
  let cache = originals.get(node);
  if (!cache) { cache = new Map(); originals.set(node, cache); }
  let entry = cache.get(key);
  if (!entry || entry.rendered !== current) entry = { source: t(current, 'uk') };
  const next = t(entry.source);
  entry.rendered = next; cache.set(key, entry);
  if (current !== next) write(next);
}
function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (!root.parentElement?.closest('script,style,textarea,noscript,[translate="no"]')) renderValue(root, 'text', root.nodeValue, next => { root.nodeValue = next; });
    return;
  }
  if (root.parentElement?.closest('[translate="no"]')) return;
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
  if (root.nodeType === Node.ELEMENT_NODE) {
    if (root.matches('script,style,noscript,[translate="no"]')) return;
    // Значення option не змінюється разом із перекладом підпису.
    if (root.matches('option:not([value])')) root.value = root.textContent;
    for (const key of attributes) if (root.hasAttribute(key)) renderValue(root, key, root.getAttribute(key), next => root.setAttribute(key, next));
    if (root.matches('meta[name="description"],meta[property="og:title"],meta[property="og:description"]')) renderValue(root, 'content', root.content, next => { root.content = next; });
  }
  if (root.nodeType === Node.ELEMENT_NODE && root.matches('textarea')) return;
  for (const child of root.childNodes) translateTree(child);
}
let observer;
function updateLanguageControls() {
  for (const button of document.querySelectorAll('[data-language-choice]')) button.setAttribute('aria-pressed', String(button.dataset.languageChoice === language));
  document.querySelector('meta[property="og:locale"]').content = language === 'en' ? 'en_GB' : 'uk_UA';
}
export function setLanguage(next) {
  language = next === 'en' ? 'en' : 'uk';
  document.documentElement.dataset.language = language; document.documentElement.lang = language;
  try { localStorage.setItem('forma-language', language); } catch { /* Без сховища перемикання теж працює. */ }
  observer?.disconnect();
  translateTree(document); updateLanguageControls();
  observer?.observe(document.documentElement, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: [...attributes, 'content'] });
}
export function initTranslations() {
  observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(translateTree);
      else translateTree(record.target);
    }
    observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: [...attributes, 'content'] });
  });
  document.querySelectorAll('[data-language-choice]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.languageChoice)));
  setLanguage(language);
}
