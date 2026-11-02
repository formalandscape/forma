// Formspree AJAX: підтвердження приймання не є перевіркою доставки у Gmail.
export async function sendInquiry(endpoint, payload, { fetchImpl = globalThis.fetch, timeoutMs = 20000 } = {}) {
  if (!/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint || '')) return { status: 'unconfigured' };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'strict-origin-when-cross-origin'
    });
    if (!response.ok) return { status: response.status === 429 ? 'rate-limited' : 'error' };
    const result = await response.json();
    if (result?.ok === true && !result.errors?.length) return { status: 'accepted' };
    return { status: 'error' };
  } catch {
    return { status: controller.signal.aborted ? 'timeout' : 'error' };
  } finally {
    clearTimeout(timeout);
  }
}
