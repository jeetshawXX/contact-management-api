export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body validation failed',
          details: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        }
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

export function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'id must be a positive integer'
      }
    });
  }
  req.contactId = id;
  next();
}
