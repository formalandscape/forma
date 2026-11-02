import test from 'node:test';
import assert from 'node:assert/strict';
import { sendInquiry } from '../inquiry.js';
const recipient = 'owner@example.com';
const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

test('sends the full inquiry to the configured recipient, with no credentials or automatic retries', async () => {
  const payload = { name: 'Тест', phone: '+380670000000', district: 'Голосіїв', message: 'Площа: 850 м²' };
  let calls = 0;
  const result = await sendInquiry(recipient, payload, { fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, 'https://formsubmit.co/ajax/owner%40example.com');
    assert.equal(options.method, 'POST'); assert.equal(options.credentials, 'omit');
    assert.equal(options.headers.Accept, 'application/json');
    assert.deepEqual(JSON.parse(options.body), payload);
    return reply({ success: 'true', message: 'Thanks! Form submitted successfully.' });
  } });
  assert.deepEqual(result, { status: 'accepted' }); assert.equal(calls, 1);
});

test('does not mistake false, missing or malformed success for acceptance', async () => {
  for (const body of [{ success: 'false' }, { success: false }, { message: 'OK' }, { success: 1 }, null]) {
    assert.equal((await sendInquiry(recipient, {}, { fetchImpl: async () => reply(body) })).status, 'error');
  }
});

test('activation messages take priority over success=true', async () => {
  for (const success of [true, 'true', false]) {
    assert.equal((await sendInquiry(recipient, {}, { fetchImpl: async () => reply({ success, message: 'Please activate your email address.' }) })).status, 'activation-required');
  }
});

test('rejects bad JSON and HTTP errors even if the body claims success', async () => {
  assert.equal((await sendInquiry(recipient, {}, { fetchImpl: async () => new Response('<html>Error</html>') })).status, 'error');
  assert.equal((await sendInquiry(recipient, {}, { fetchImpl: async () => reply({ success: true }, 503) })).status, 'error');
});

test('reports a rate limit', async () => {
  assert.equal((await sendInquiry(recipient, {}, { fetchImpl: async () => reply({}, 429) })).status, 'rate-limited');
});

test('reports a network failure without retrying', async () => {
  let calls = 0;
  assert.equal((await sendInquiry(recipient, {}, { fetchImpl: async () => { calls++; throw new TypeError('Failed to fetch'); } })).status, 'error');
  assert.equal(calls, 1);
});

test('aborts a request that does not respond', async () => {
  assert.equal((await sendInquiry(recipient, {}, { timeoutMs: 10, fetchImpl: (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }) })).status, 'timeout');
});

test('does not send anything when no valid recipient is configured', async () => {
  for (const address of ['', null, 'not-an-email']) {
    assert.equal((await sendInquiry(address, {}, { fetchImpl: async () => assert.fail('must not send') })).status, 'unconfigured');
  }
});
