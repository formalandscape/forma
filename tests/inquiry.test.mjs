import test from 'node:test';
import assert from 'node:assert/strict';
import { sendInquiry } from '../inquiry.js';
const endpoint = 'https://formspree.io/f/testform';
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('sends the full inquiry to the configured endpoint, with no credentials or automatic retries', async () => {
  const payload = { name: 'Тест', phone: '+380670000000', district: 'Голосіїв', message: 'Площа: 850 м²' };
  let calls = 0;
  const result = await sendInquiry(endpoint, payload, { fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, 'https://formspree.io/f/testform');
    assert.equal(options.method, 'POST'); assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Accept, 'application/json');
    assert.deepEqual(JSON.parse(options.body), payload);
    return reply({ ok: true, next: '/thanks' });
  } });
  assert.deepEqual(result, { status: 'accepted' }); assert.equal(calls, 1);
});

test('does not mistake false, missing or malformed success for acceptance', async () => {
  for (const body of [{ ok: 'true' }, { ok: false }, { success: true }, { message: 'OK' }, { ok: 1 }, null]) {
    assert.equal((await sendInquiry(endpoint, {}, { fetchImpl: async () => reply(body) })).status, 'error');
  }
});

test('does not accept a body that also contains provider errors', async () => {
  assert.equal((await sendInquiry(endpoint, {}, { fetchImpl: async () => reply({ ok: true, errors: [{ message: 'Rejected' }] }) })).status, 'error');
});

test('rejects bad JSON and HTTP errors even if the body claims success', async () => {
  assert.equal((await sendInquiry(endpoint, {}, { fetchImpl: async () => new Response('<html>Error</html>') })).status, 'error');
  assert.equal((await sendInquiry(endpoint, {}, { fetchImpl: async () => reply({ ok: true }, 503) })).status, 'error');
});

test('reports a rate limit', async () => {
  assert.equal((await sendInquiry(endpoint, {}, { fetchImpl: async () => reply({}, 429) })).status, 'rate-limited');
});

test('reports a network failure without retrying', async () => {
  let calls = 0;
  assert.equal((await sendInquiry(endpoint, {}, { fetchImpl: async () => { calls++; throw new TypeError('Failed to fetch'); } })).status, 'error');
  assert.equal(calls, 1);
});

test('aborts a request that does not respond', async () => {
  assert.equal((await sendInquiry(endpoint, {}, { timeoutMs: 10, fetchImpl: (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }) })).status, 'timeout');
});

test('does not send anything when no valid endpoint is configured', async () => {
  for (const address of ['', null, 'https://other.example/f/test', 'https://formspree.io.evil.example/f/test']) {
    assert.equal((await sendInquiry(address, {}, { fetchImpl: async () => assert.fail('must not send') })).status, 'unconfigured');
  }
});
