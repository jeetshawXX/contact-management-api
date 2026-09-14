import { Router } from 'express';
import { createContact, deleteContact, getContact, listContacts, updateContact } from '../controllers/contacts.js';
import { validateBody, validateId } from '../middleware/requestValidation.js';
import { createContactSchema, updateContactSchema } from '../utils/validation.js';

const router = Router();

router.get('/', listContacts);
router.get('/:id', validateId, getContact);
router.post('/', validateBody(createContactSchema), createContact);
router.patch('/:id', validateId, validateBody(updateContactSchema), updateContact);
router.delete('/:id', validateId, deleteContact);

export default router;
