import { db } from '../config/db.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';

const SORT_COLUMNS = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  company: 'company',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

export function listContacts(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const company = typeof req.query.company === 'string' ? req.query.company.trim() : '';
    const sort = SORT_COLUMNS[req.query.sort] || 'created_at';
    const order = String(req.query.order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const where = [];
    const params = {};

    if (q) {
      where.push('(name LIKE @search OR email LIKE @search OR phone LIKE @search)');
      params.search = `%${q}%`;
    }
    if (company) {
      where.push('company LIKE @company');
      params.company = `%${company}%`;
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = db.prepare(`SELECT COUNT(*) AS count FROM contacts ${whereSql}`).get(params).count;
    const data = db.prepare(`
      SELECT id, name, email, phone, address, company, created_at, updated_at
      FROM contacts
      ${whereSql}
      ORDER BY ${sort} ${order}, id ASC
      LIMIT @limit OFFSET @offset
    `).all({ ...params, limit, offset });

    return res.json({ data, meta: buildMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export function getContact(req, res, next) {
  try {
    const contact = db.prepare('SELECT id, name, email, phone, address, company, created_at, updated_at FROM contacts WHERE id = ?').get(req.contactId);
    if (!contact) {
      return res.status(404).json({ error: { code: 'CONTACT_NOT_FOUND', message: 'Contact not found' } });
    }
    return res.json({ data: contact });
  } catch (err) {
    next(err);
  }
}

export function createContact(req, res, next) {
  try {
    const { name, email, phone, address, company } = req.validatedBody;
    const duplicate = db.prepare('SELECT id, email, phone FROM contacts WHERE email = ? COLLATE NOCASE OR phone = ?').get(email, phone);
    if (duplicate) {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_CONTACT',
          message: 'A contact with the same email or phone number already exists'
        }
      });
    }

    const result = db.prepare(`
      INSERT INTO contacts (name, email, phone, address, company)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, phone, address, company);

    const contact = db.prepare('SELECT id, name, email, phone, address, company, created_at, updated_at FROM contacts WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ data: contact });
  } catch (err) {
    next(err);
  }
}

export function updateContact(req, res, next) {
  try {
    const current = db.prepare('SELECT id, name, email, phone, address, company FROM contacts WHERE id = ?').get(req.contactId);
    if (!current) {
      return res.status(404).json({ error: { code: 'CONTACT_NOT_FOUND', message: 'Contact not found' } });
    }

    const nextContact = { ...current, ...req.validatedBody };
    const duplicate = db.prepare(`
      SELECT id FROM contacts
      WHERE id != ? AND (email = ? COLLATE NOCASE OR phone = ?)
    `).get(req.contactId, nextContact.email, nextContact.phone);
    if (duplicate) {
      return res.status(409).json({ error: { code: 'DUPLICATE_CONTACT', message: 'A contact with the same email or phone number already exists' } });
    }

    db.prepare(`
      UPDATE contacts
      SET name = ?, email = ?, phone = ?, address = ?, company = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(nextContact.name, nextContact.email, nextContact.phone, nextContact.address, nextContact.company, req.contactId);

    const updated = db.prepare('SELECT id, name, email, phone, address, company, created_at, updated_at FROM contacts WHERE id = ?').get(req.contactId);
    return res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export function deleteContact(req, res, next) {
  try {
    const result = db.prepare('DELETE FROM contacts WHERE id = ?').run(req.contactId);
    if (result.changes === 0) {
      return res.status(404).json({ error: { code: 'CONTACT_NOT_FOUND', message: 'Contact not found' } });
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
