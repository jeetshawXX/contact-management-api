import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const testDb = path.resolve('data/test-contacts.db');
process.env.DB_FILE = testDb;
process.env.NODE_ENV = 'test';
try { fs.rmSync(testDb, { force: true }); } catch {}
try { fs.rmSync(`${testDb}-wal`, { force: true }); fs.rmSync(`${testDb}-shm`, { force: true }); } catch {}

const { app } = await import('../src/app.js');
await import('../src/config/db.js');

const server = app.listen(0);
const baseUrl = `http://127.0.0.1:${server.address().port}`;

async function request(pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
}

after(async () => {
  server.close();
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(`${testDb}${suffix}`, { force: true });
});

test('health endpoint', async () => {
  const response = await request('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'contact-management-api' });
});

test('contact CRUD + validation + duplicate prevention', async () => {
  let response = await request('/api/contacts', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Jeet Shaw', email: 'jeet@example.com', phone: '+91 9876543210',
      address: 'Bardhaman, West Bengal', company: 'Example Technologies'
    })
  });
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.equal(created.data.id, 1);

  response = await request('/api/contacts', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Duplicate', email: 'JEET@example.com', phone: '+91 9999999999',
      address: 'Somewhere', company: 'Example'
    })
  });
  assert.equal(response.status, 409);

  response = await request('/api/contacts', {
    method: 'POST',
    body: JSON.stringify({ name: 'Bad', email: 'not-email', phone: '12', address: '', company: 'X' })
  });
  assert.equal(response.status, 400);

  response = await request('/api/contacts/1', {
    method: 'PATCH',
    body: JSON.stringify({ company: 'Updated Company' })
  });
  assert.equal(response.status, 200);
  const updated = await response.json();
  assert.equal(updated.data.company, 'Updated Company');

  response = await request('/api/contacts/1');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.name, 'Jeet Shaw');

  response = await request('/api/contacts/1', { method: 'DELETE' });
  assert.equal(response.status, 204);

  response = await request('/api/contacts/1');
  assert.equal(response.status, 404);
});

test('search, filtering, sorting and pagination', async () => {
  const contacts = [
    ['Alice Brown', 'alice@example.com', '+1 2025551001', 'New York', 'Acme'],
    ['Bob Carter', 'bob@example.com', '+1 2025551002', 'London', 'Beta'],
    ['Carol Davis', 'carol@example.com', '+1 2025551003', 'Delhi', 'Acme'],
    ['David Evans', 'david@example.com', '+1 2025551004', 'Pune', 'Gamma']
  ];
  for (const [name, email, phone, address, company] of contacts) {
    const response = await request('/api/contacts', {
      method: 'POST', body: JSON.stringify({ name, email, phone, address, company })
    });
    assert.equal(response.status, 201);
  }

  let response = await request('/api/contacts?q=alice');
  let body = await response.json();
  assert.equal(body.data.length, 1);
  assert.equal(body.data[0].name, 'Alice Brown');

  response = await request('/api/contacts?q=2025551003');
  body = await response.json();
  assert.equal(body.data[0].name, 'Carol Davis');

  response = await request('/api/contacts?company=Acme&sort=name&order=asc');
  body = await response.json();
  assert.equal(body.data.length, 2);
  assert.equal(body.data[0].name, 'Alice Brown');

  response = await request('/api/contacts?page=1&limit=2&sort=name&order=asc');
  body = await response.json();
  assert.equal(body.data.length, 2);
  assert.equal(body.meta.total, 4);
  assert.equal(body.meta.total_pages, 2);
  assert.equal(body.meta.has_next_page, true);
});
