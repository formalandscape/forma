const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Відкрити меню'); }
menu.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню'); });
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  document.querySelectorAll('[data-category]').forEach(project => { project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter; });
}));
const projects = {
  quiet: ['Тиша серед зелені', 'Концепція приватного саду площею 12 соток. Звивисті доріжки, багаторічні трави та камерна зона відпочинку створюють простір для спокійних ранків. Пропонуємо природні посадки з виразною сезонністю.'],
  terrace: ['Ближче до природи', 'Концепція тераси площею 65 м². Теплі фактури, контейнерне озеленення та зручні місця для відпочинку поєднують інтер’єр із відкритим простором. Підбір рослин залежить від освітлення та вітрового навантаження.'],
  slow: ['Сад повільного життя', 'Концепція сімейного саду площею 18 соток. Відкритий газон для ігор, плодові дерева та затишна обідня зона. Передбачено зручне зонування й сезонний план догляду.'],
  park: ['Місце для зустрічей', 'Концепція міського скверу площею 0,4 га. Доступні маршрути, тінь від дерев та місця для спілкування. Стійкі посадки й дощові сади допомагають створити комфортний мікроклімат.']
};
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => { const [title, description] = projects[button.dataset.project]; document.querySelector('#dialog-title').textContent = title; document.querySelector('#dialog-description').textContent = description; dialog.setAttribute('aria-labelledby', 'dialog-title'); dialog.showModal(); }));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('#dialog-contact').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => { document.querySelector('#service').value = link.dataset.service; }));
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
  const data = new FormData(form);
  document.querySelector('#message-draft').value = `Вітаю! Мене звати ${data.get('name')}.\nЕлектронна пошта: ${data.get('email')}\nПослуга: ${data.get('service')}\n\n${data.get('message')}`;
  document.querySelector('#form-result').hidden = false;
  document.querySelector('#copy-draft').textContent = 'Скопіювати текст';
});
document.querySelector('#copy-draft').addEventListener('click', async event => {
  const draft = document.querySelector('#message-draft');
  try { await navigator.clipboard.writeText(draft.value); event.currentTarget.textContent = 'Скопійовано ✓'; }
  catch { draft.focus(); draft.select(); event.currentTarget.textContent = 'Натисніть Ctrl+C / ⌘C'; }
});
document.querySelector('#year').textContent = new Date().getFullYear();
