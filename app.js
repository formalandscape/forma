import { content } from './content.js?v=formspree-1';
import { sendInquiry } from './inquiry.js?v=formspree-1';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const text = (selector, value) => { $(selector).textContent = value; };
function element(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}
const services = content.services.filter(service => service.visible);
const projects = content.projects.filter(project => project.visible);
const menu = $('.menu-toggle');
const navigation = $('#navigation');
function closeMenu(returnFocus = false) {
  const wasOpen = navigation.classList.contains('open');
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Відкрити меню');
  if (returnFocus && wasOpen) menu.focus();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(true); });
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Зберігаємо типографічну композицію для початкового тексту. Зміни власника беруться з даних.
if ($('#hero-title').textContent.replace(/\s+/g, ' ').trim().replace(/\.$/, '') !== content.hero.title) {
  text('#hero-title', content.hero.title);
}
text('#hero-description', content.hero.subtitle);
$('#hero-image').src = content.hero.image;
$('#hero-image').srcset = `${content.hero.imageSmall} 900w, ${content.hero.image} 1600w`;
$('#hero-image').alt = content.hero.alt;
text('#hero-caption', content.hero.caption);
if ($('#about-title').textContent.replace(/\s+/g, ' ').trim() !== content.about.title) text('#about-title', content.about.title);
text('#about-one', content.about.paragraphs[0] || '');
text('#about-two', content.about.paragraphs[1] || '');
text('#area-name', content.contacts.area);
text('#area-detail', content.contacts.areaDetail);
text('#year', new Date().getFullYear());
text('#privacy-email', content.contacts.email || 'адресу ще не додано');

const icons = {
  plan: '<rect x="6" y="6" width="30" height="30"/><path d="M6 22h30M22 6v30M11 13h6m-6 4h6m10 11h4"/>',
  leaf: '<path d="M9 35C7 17 19 6 36 6c0 17-8 30-27 29zm0 0L29 13M16 27l-1-10m7 4h10"/>',
  path: '<path d="M5 36h32M8 27h25M12 18h17M16 9h9M9 36l7-27m17 27L25 9"/>'
};
services.forEach((service, index) => {
  const card = element('article', 'service-card reveal');
  card.style.setProperty('--delay', `${index * 90}ms`);
  const top = element('div', 'service-top');
  top.append(element('span', '', String(index + 1).padStart(2, '0')));
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 42 42'); icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = icons[service.icon] || icons.plan;
  top.append(icon);
  const list = element('ul');
  service.details.forEach(detail => list.append(element('li', '', detail)));
  const note = element('div', 'service-note', service.confirmed ? 'Склад робіт визначаємо індивідуально' : 'Можлива послуга · потребує підтвердження');
  const link = element('a', 'text-link', 'Обговорити напрям'); link.href = '#contact'; link.append(element('span', '', '↗'));
  link.addEventListener('click', () => { $('#service').value = service.id; clearSubmissionResult(); });
  card.append(top, element('h3', '', service.title), element('p', '', service.description), list, note, link);
  $('#service-grid').append(card);
});
for (const select of [$('#service'), $('#estimate-service')]) {
  select.append(new Option('Потрібна консультація', 'consultation'));
  services.forEach(service => select.append(new Option(service.title, service.id)));
}
content.process.forEach((step, index) => {
  const item = element('li', 'reveal'); item.style.setProperty('--delay', `${index * 90}ms`);
  item.append(element('span', 'step-number', String(index + 1).padStart(2, '0')), element('h3', '', step.title), element('p', '', step.text));
  $('#steps').append(item);
});

let currentFilter = 'all';
let selectedProject = 0;
let visibleProjects = projects;
const projectDialog = $('#project-dialog');
function refreshDialog() {
  const project = visibleProjects[selectedProject];
  if (!project) return;
  const image = $('#dialog-image'); image.src = project.full; image.alt = project.alt;
  text('#dialog-title', project.title); text('#dialog-description', project.description);
  text('#dialog-tag', `${project.demonstration ? 'ФОТО ДЛЯ НАТХНЕННЯ' : 'ПРОЄКТ FORMA'} · ${selectedProject + 1} / ${visibleProjects.length}`);
  $('#previous-project').hidden = $('#next-project').hidden = visibleProjects.length < 2;
}
function showDialog(dialog) { dialog.showModal(); document.body.classList.add('modal-open'); }
function renderProjects() {
  visibleProjects = projects.filter(project => currentFilter === 'all' || project.category === currentFilter);
  const grid = $('#project-grid'); grid.replaceChildren(); grid.classList.toggle('single', visibleProjects.length === 1);
  visibleProjects.forEach((project, index) => {
    const card = element('article', 'project reveal'); card.style.setProperty('--delay', `${index * 70}ms`);
    const button = element('button', 'project-photo'); button.type = 'button'; button.setAttribute('aria-label', `Збільшити фото: ${project.title}`);
    const image = element('img'); image.src = project.image;
    if (project.thumbnail) image.srcset = `${project.thumbnail} 480w, ${project.image} 900w`;
    image.sizes = '(max-width: 760px) 100vw, 50vw'; image.alt = project.alt; image.loading = 'lazy'; image.decoding = 'async'; image.width = 900; image.height = 750;
    const zoom = element('span', 'zoom-icon arrow-icon'); zoom.setAttribute('aria-hidden', 'true');
    button.append(image, element('span', 'photo-tag', project.demonstration ? 'ФОТО ДЛЯ НАТХНЕННЯ' : 'ПРОЄКТ FORMA'), zoom);
    button.addEventListener('click', () => { selectedProject = index; refreshDialog(); showDialog(projectDialog); });
    const info = element('div', 'project-info'); const title = element('div');
    title.append(element('h3', '', project.title), element('p', '', project.subtitle));
    info.append(title, element('span', 'project-number', String(index + 1).padStart(2, '0')));
    card.append(button, info); grid.append(card);
  });
  if (!visibleProjects.length) grid.append(element('p', 'small-note', 'Проєкти цієї категорії ще не додано.'));
  text('#filter-status', `Показано проєктів: ${visibleProjects.length}.`);
  observeReveals();
}
content.categories.forEach(category => {
  const count = projects.filter(project => category.id === 'all' || project.category === category.id).length;
  if (!count && category.id !== 'all') return;
  const button = element('button', category.id === 'all' ? 'active' : '', category.title); button.type = 'button'; button.dataset.filter = category.id;
  button.setAttribute('aria-pressed', String(category.id === 'all'));
  button.append(element('sup', '', String(count).padStart(2, '0')));
  button.addEventListener('click', () => {
    currentFilter = category.id;
    $$('#project-filters button').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
    renderProjects();
  });
  $('#project-filters').append(button);
});
if (!projects.length) text('#gallery-note', 'Портфоліо готується до публікації.');
else if (!projects.some(project => project.demonstration)) text('#gallery-note', 'Реалізовані проєкти FORMA.');
function stepProject(direction) { selectedProject = (selectedProject + direction + visibleProjects.length) % visibleProjects.length; refreshDialog(); }
$('#previous-project').addEventListener('click', () => stepProject(-1));
$('#next-project').addEventListener('click', () => stepProject(1));
projectDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); stepProject(event.key === 'ArrowLeft' ? -1 : 1); }
});
$('#dialog-contact').addEventListener('click', () => { projectDialog.close(); });
$$('dialog').forEach(dialog => {
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
$('#privacy-open').addEventListener('click', () => showDialog($('#privacy-dialog')));

$('#comparison-section').hidden = !content.comparison.visible;
for (const state of ['before', 'after']) {
  const image = $(`#comparison-${state}`); image.src = content.comparison[state]; image.alt = content.comparison[`${state}Alt`];
}
text('#comparison-note', content.comparison.note);
function updateComparison() {
  const value = $('#comparison-range').value;
  $('#comparison').style.setProperty('--split', `${value}%`);
  $('#comparison-range').setAttribute('aria-valuetext', `До: ${value} відсотків, після: ${100 - Number(value)} відсотків`);
}
$('#comparison-range').addEventListener('input', updateComparison); updateComparison();

function phoneNumber(raw) {
  if (!raw || /[^\d+\s()\-]/.test(raw)) return null;
  let digits = raw.replace(/\D/g, '');
  if (/^0\d{9}$/.test(digits)) digits = `38${digits}`;
  return /^380\d{9}$/.test(digits) ? `+${digits}` : null;
}
function validEmail(raw) { return typeof raw === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw); }
const companyPhone = phoneNumber(content.contacts.phone);
const companyEmail = validEmail(content.contacts.email) ? content.contacts.email : null;
if (companyPhone) {
  const link = element('a', '', content.contacts.phone); link.href = `tel:${companyPhone}`; $('#phone-slot').replaceChildren(link);
  $('#quick-call').href = `tel:${companyPhone}`; $('#quick-call').setAttribute('aria-label', 'Зателефонувати до FORMA'); text('#quick-call-label', 'Зателефонувати');
}
if (companyEmail) { const link = element('a', '', companyEmail); link.href = `mailto:${companyEmail}`; $('#email-slot').replaceChildren(link); }
for (const [key, title] of [['telegram', 'Telegram'], ['viber', 'Viber']]) {
  const raw = content.contacts[key]; let href;
  try { const url = new URL(raw); if ((url.protocol === 'https:' && ['t.me', 'telegram.me', 'www.viber.com', 'invite.viber.com'].includes(url.hostname)) || (key === 'viber' && url.protocol === 'viber:')) href = url.href; } catch { /* Залишити заглушку. */ }
  const item = element(href ? 'a' : 'span', '', title);
  if (href) { item.href = href; item.rel = 'noopener noreferrer'; }
  else item.append(element('small', '', 'Посилання ще не додано'));
  $('#messengers').append(item);
}
$('#contact-placeholder').hidden = Boolean(companyPhone && companyEmail);
if (companyEmail && !companyPhone) text('#contact-placeholder', 'Для зв’язку напишіть на електронну пошту. Телефон і месенджери ще не додано.');

let estimate = null;
$('#estimate-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  estimate = { area: $('#plot-size').value, state: $('#plot-state').value, service: $('#estimate-service').selectedOptions[0].textContent };
  text('#estimate-summary-text', ['Індивідуальний розрахунок', estimate.area ? `Площа: ${estimate.area} м²` : 'Площа: уточнити', estimate.state || 'Стан: уточнити', estimate.service].join(' · '));
  $('#estimate-summary').hidden = false;
  $('#service').value = $('#estimate-service').value;
  $('#contact').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  $('#name').focus({ preventScroll: true });
  clearSubmissionResult();
});
$('#clear-estimate').addEventListener('click', () => { estimate = null; $('#estimate-summary').hidden = true; clearSubmissionResult(); });
function validateField(field) {
  let message = '';
  if (field.id === 'name' && field.value.trim().length < 2) message = 'Вкажіть ім’я — щонайменше 2 символи.';
  if (field.id === 'phone' && !phoneNumber(field.value)) message = 'Вкажіть номер у форматі +380XXXXXXXXX або 0XXXXXXXXX.';
  if (field.id === 'district' && field.value.trim().length < 3) message = 'Вкажіть район або місцевість на правому березі Києва.';
  field.setAttribute('aria-invalid', String(Boolean(message)));
  text(`#${field.id}-error`, message);
  return !message;
}
const requiredFields = [$('#name'), $('#phone'), $('#district')];
requiredFields.forEach(field => {
  field.addEventListener('blur', () => { if (field.value || field.hasAttribute('aria-invalid')) validateField(field); });
  field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validateField(field); });
});
const inquiryForm = $('#contact-form');
const submitButton = $('#inquiry-submit');
let submitting = false;
function clearSubmissionResult() {
  if (submitting) return;
  $('#form-result').hidden = true;
  $('#submission-status').hidden = true;
  submitButton.disabled = false;
  text('#submit-label', 'Надіслати звернення');
}
inquiryForm.addEventListener('input', event => {
  if (event.target !== $('#message-draft')) clearSubmissionResult();
});
inquiryForm.addEventListener('change', clearSubmissionResult);
function showSubmissionStatus(state, message) {
  const status = $('#submission-status');
  status.hidden = false; status.dataset.state = state; status.textContent = message;
}
inquiryForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting || submitButton.disabled) return;
  const invalid = requiredFields.filter(field => !validateField(field));
  if (invalid.length) { invalid[0].focus(); return; }
  if ($('#website').value) {
    showSubmissionStatus('error', 'Надсилання заблоковано перевіркою від спаму. Оновіть сторінку або напишіть нам на пошту.');
    return;
  }
  const lines = ['Вітаю, FORMA!', `Мене звати ${$('#name').value.trim()}.`, `Телефон: ${phoneNumber($('#phone').value)}`, `Розташування: ${$('#district').value.trim()}`, `Напрям: ${$('#service').selectedOptions[0].textContent}`];
  if (estimate) lines.push(`Площа ділянки: ${estimate.area ? `${estimate.area} м²` : 'уточнити'}`, `Стан ділянки: ${estimate.state || 'уточнити'}`, 'Прошу підготувати індивідуальний розрахунок.');
  if ($('#message').value.trim()) lines.push('', $('#message').value.trim());
  $('#message-draft').value = lines.join('\n');
  $('#form-result').hidden = true; text('#copy-status', '');
  if (companyEmail) {
    $('#email-draft').hidden = false;
    $('#email-draft').href = `mailto:${companyEmail}?subject=${encodeURIComponent('Консультація FORMA')}&body=${encodeURIComponent(lines.join('\n'))}`;
  }
  const payload = {
    subject: 'FORMA — нове звернення із сайту',
    _gotcha: $('#website').value,
    name: $('#name').value.trim(), phone: phoneNumber($('#phone').value),
    district: $('#district').value.trim(), service: $('#service').selectedOptions[0].textContent,
    message: lines.join('\n'), source: window.location.href.split('#')[0]
  };
  submitting = true; submitButton.disabled = true;
  inquiryForm.setAttribute('aria-busy', 'true');
  text('#submit-label', 'Надсилаємо…');
  showSubmissionStatus('pending', 'Надсилаємо ваше звернення. Зачекайте, будь ласка.');
  const controls = $$('input, select, textarea:not([readonly])', inquiryForm);
  controls.forEach(control => { control.disabled = true; });
  let result;
  try {
    result = await sendInquiry(content.inquiryEndpoint, payload);
  } finally {
    submitting = false; inquiryForm.removeAttribute('aria-busy');
    controls.forEach(control => { control.disabled = false; });
    submitButton.disabled = false; text('#submit-label', 'Надіслати звернення');
  }
  if (result.status === 'accepted') {
    showSubmissionStatus('success', 'Дякуємо! Ваше звернення прийнято до надсилання FORMA.');
    text('#submit-label', 'Звернення прийнято');
    submitButton.disabled = true; // Нове звернення можливе після зміни полів.
    return;
  }
  const messages = {
    unconfigured: 'Отримання заявок тимчасово не налаштовано. Збережіть текст звернення.',
    'rate-limited': 'Забагато спроб надсилання. Зачекайте кілька хвилин або напишіть нам на пошту.',
    timeout: 'Не вдалося підтвердити надсилання: сервіс відповідає надто довго. Ваші дані залишилися у формі. Можна надіслати їх поштою.',
    error: 'Не вдалося підтвердити надсилання. Дані залишилися у формі. Спробуйте пізніше або надішліть звернення поштою.'
  };
  showSubmissionStatus('error', messages[result.status] || messages.error);
  $('#form-result').hidden = false;
});
$('#copy-draft').addEventListener('click', async () => {
  const draft = $('#message-draft');
  try { await navigator.clipboard.writeText(draft.value); text('#copy-status', 'Скопійовано. Надішліть текст самостійно через підтверджений контакт FORMA.'); }
  catch { draft.focus(); draft.select(); text('#copy-status', 'Автоматичне копіювання недоступне. Скопіюйте виділений текст: Ctrl+C / ⌘C або меню копіювання телефона.'); }
});

let revealObserver;
function observeReveals() {
  if (revealObserver) $$('.reveal:not(.is-visible)').forEach(item => revealObserver.observe(item));
}
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }), { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.documentElement.classList.add('motion-ready');
}
renderProjects(); observeReveals();
reducedMotion.addEventListener('change', event => {
  if (event.matches) { document.documentElement.classList.remove('motion-ready'); revealObserver?.disconnect(); }
});
if ('IntersectionObserver' in window) {
  const footerObserver = new IntersectionObserver(entries => $('#quick-call').classList.toggle('at-footer', entries[0].isIntersecting));
  footerObserver.observe($('.footer'));
  const navObserver = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      $$('#navigation a').forEach(link => { if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    }
  }, { rootMargin: '-20% 0px -55% 0px' });
  $$('main section[id]').forEach(section => navObserver.observe(section));
}

// Векторні стрілки однаково відображаються на всіх платформах.
$$('.button > span, .text-link > span, .header-contact > span, .zoom-icon').forEach(span => {
  if (span.textContent.trim() !== '↗') return;
  span.textContent = ''; span.classList.add('arrow-icon'); span.setAttribute('aria-hidden', 'true');
});
