import { z } from 'zod';

const trimmedText = (label, max) => z.string({ required_error: `${label} is required` }).trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

export const createContactSchema = z.object({
  name: trimmedText('name', 120),
  email: z.string({ required_error: 'email is required' }).trim().email('email must be a valid email address').max(254, 'email must be at most 254 characters'),
  phone: z.string({ required_error: 'phone is required' }).trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'phone must contain 7-20 valid phone characters'),
  address: trimmedText('address', 300),
  company: trimmedText('company', 150)
}).strict();

export const updateContactSchema = createContactSchema.partial().strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required for update'
});

export const contactIdSchema = z.coerce.number().int().positive();
