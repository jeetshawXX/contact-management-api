import express from 'express';
import helmet from 'helmet';
import contactsRouter from './routes/contacts.js';
import { errorHandler, notFound } from './middleware/errors.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '32kb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'contact-management-api' });
});

app.use('/api/contacts', contactsRouter);
app.use(notFound);
app.use(errorHandler);
