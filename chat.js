import { chatCopy } from './chat-copy.js?v=chat-faq-2';

export function initChat({ chatEndpoint, contacts }) {
  // No provider credentials or automatic requests in the browser.
  const endpoint = typeof chatEndpoint === 'string' && (chatEndpoint === '/api/chat' || /^https:\/\//.test(chatEndpoint)) ? chatEndpoint : null;
  const root = document.createElement('aside');
  root.className = 'forma-chat'; root.lang = 'uk'; root.setAttribute('translate', 'no');
  root.innerHTML = `<button class="chat-launcher" type="button" aria-controls="forma-chat-panel" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z"/><path d="M7 10h8M7 14h5"/></svg><span></span></button>
    <section id="forma-chat-panel" class="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>
      <header class="chat-header"><div><span class="chat-mark" aria-hidden="true">F</span><h2 id="chat-title"></h2></div><button class="chat-close" type="button">×</button></header>
      <div class="chat-messages" role="log" aria-live="polite" aria-relevant="additions" tabindex="0"></div>
      <div class="chat-topics" role="group" aria-label="Поширені запитання"></div><p class="chat-status" role="status"></p>
      <form class="chat-form" hidden><label class="sr-only" for="chat-question"></label><div><input id="chat-question" maxlength="1500" required autocomplete="off"><button type="submit"></button></div><p class="chat-privacy"></p></form>
      <div class="chat-footer"><a target="_blank" rel="noopener noreferrer"></a><button type="button"></button></div>
    </section>`;
  document.body.append(root);
  const $ = selector => root.querySelector(selector);
  const launcher = $('.chat-launcher'), panel = $('.chat-panel'), log = $('.chat-messages');
  const input = $('#chat-question'), form = $('.chat-form'), status = $('.chat-status');
  const history = [];
  let busy = false, controller, errorKey = '', renderedMessages = [];
  function renderMessages() {
    const messages = [chatCopy.intro, ...history.map(item => item.topic !== undefined ? chatCopy[item.role === 'user' ? 'questions' : 'answers'][item.topic] : item.content)];
    if (renderedMessages.some((text, index) => messages[index] !== text)) { log.replaceChildren(); renderedMessages = []; }
    const previousLength = renderedMessages.length;
    const append = (text, role) => {
      const bubble = document.createElement('p'); bubble.className = `chat-bubble chat-${role}`;
      bubble.textContent = text; log.append(bubble);
    };
    messages.slice(previousLength).forEach((text, index) => append(text, previousLength + index === 0 ? 'assistant' : history[previousLength + index - 1].role));
    renderedMessages = messages;
    log.scrollTop = log.scrollHeight;
  }
  function update() {
    const c = chatCopy;
    $('.chat-launcher span').textContent = c.open;
    $('#chat-title').textContent = endpoint ? c.aiTitle : c.title;
    $('.chat-close').setAttribute('aria-label', c.close); log.setAttribute('aria-label', endpoint ? c.aiTitle : c.title);
    $('.chat-form label').textContent = c.label; input.placeholder = c.placeholder;
    $('.chat-form button').textContent = c.send; $('.chat-privacy').textContent = c.privacy;
    $('.chat-footer a').textContent = c.telegram; $('.chat-footer a').href = contacts.telegram;
    $('.chat-footer button').textContent = c.clear; $('.chat-footer button').disabled = busy;
    form.hidden = !endpoint; input.disabled = busy; $('.chat-form button').disabled = busy;
    status.textContent = busy ? c.pending : errorKey ? c[errorKey] : endpoint ? '' : c.hint;
    topicButtons.forEach(button => { button.disabled = busy; });
    // Do not rebuild the live log while someone is typing or only changing status.
    renderMessages();
  }
  // Keep the same buttons after each answer so keyboard focus is preserved.
  const topicButtons = chatCopy.questions.map((question, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = question;
    button.addEventListener('click', () => {
      history.push({ role: 'user', topic: index }, { role: 'assistant', topic: index });
      history.splice(0, Math.max(0, history.length - 20)); errorKey = ''; update();
    });
    return button;
  });
  $('.chat-topics').append(...topicButtons);
  function close() { panel.hidden = true; launcher.setAttribute('aria-expanded', 'false'); launcher.focus({ preventScroll: true }); }
  launcher.addEventListener('click', () => {
    if (!panel.hidden) return close();
    panel.hidden = false; launcher.setAttribute('aria-expanded', 'true');
    $('.chat-close').focus({ preventScroll: true }); log.scrollTop = log.scrollHeight;
  });
  $('.chat-close').addEventListener('click', close);
  root.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); event.stopPropagation(); close(); } });
  $('.chat-footer button').addEventListener('click', () => { history.length = 0; errorKey = ''; input.value = ''; update(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!endpoint || busy || !question) return;
    const messages = history.slice(-10).map(item => ({ role: item.role, content: item.topic !== undefined ? chatCopy[item.role === 'user' ? 'questions' : 'answers'][item.topic] : item.content }));
    messages.push({ role: 'user', content: question });
    while (messages.reduce((size, item) => size + item.content.length, 0) > 16000) messages.shift();
    history.push({ role: 'user', content: question }); busy = true; errorKey = ''; input.value = ''; update();
    controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', body: JSON.stringify({ language: 'uk', messages }), signal: controller.signal });
      if (response.status === 429) { errorKey = 'limit'; throw new Error('limit'); }
      if (!response.ok) throw new Error('unavailable');
      const data = await response.json();
      if (typeof data.reply !== 'string' || !data.reply.trim() || data.reply.length > 8000) throw new Error('invalid');
      history.push({ role: 'assistant', content: data.reply });
    } catch {
      history.pop(); input.value = question; errorKey ||= 'error';
    } finally {
      clearTimeout(timeout); busy = false; history.splice(0, Math.max(0, history.length - 20)); update();
    }
  });
  update();
}
