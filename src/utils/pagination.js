const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function parsePagination(query) {
  const page = Number.parseInt(query.page ?? '1', 10);
  const limit = Number.parseInt(query.limit ?? String(DEFAULT_LIMIT), 10);

  if (!Number.isInteger(page) || page < 1) {
    const error = new Error('page must be a positive integer');
    error.code = 'INVALID_PAGINATION';
    error.status = 400;
    throw error;
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    const error = new Error(`limit must be an integer between 1 and ${MAX_LIMIT}`);
    error.code = 'INVALID_PAGINATION';
    error.status = 400;
    throw error;
  }

  return { page, limit, offset: (page - 1) * limit };
}

export function buildMeta(total, page, limit) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    total_pages: totalPages,
    has_next_page: page < totalPages,
    has_previous_page: page > 1 && totalPages > 0
  };
}
