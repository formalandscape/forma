// Офіційний AJAX endpoint: https://formsubmit.co/ajax-documentation
// Відповідь сервісу означає приймання запиту, а не перевірену доставку у Gmail.
export async function sendInquiry(recipient, payload, { fetchImpl = globalThis.fetch, timeoutMs = 20000 } = {}) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient || '')) return { status: 'unconfigured' };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'strict-origin-when-cross-origin'
    });
    if (!response.ok) return { status: response.status === 429 ? 'rate-limited' : 'error' };
    const result = await response.json();
    if (!result || typeof result !== 'object') return { status: 'error' };
    // Деякі відповіді про активацію також мають success: true.
    if (typeof result.message === 'string' && /activat|confirm.{0,40}(email|address)|verif.{0,40}(email|address)/i.test(result.message)) {
      return { status: 'activation-required' };
    }
    if (result.success === true || result.success === 'true') return { status: 'accepted' };
    return { status: 'error' };
  } catch {
    return { status: controller.signal.aborted ? 'timeout' : 'error' };
  } finally {
    clearTimeout(timeout);
  }
}
