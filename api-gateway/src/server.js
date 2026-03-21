import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { authenticate } from './middleware/authenticate.js';
import { authController } from './controllers/authController.js';

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/refresh', authController.refresh);
app.post('/auth/logout', authenticate, authController.logout);
app.get('/auth/me', authenticate, authController.me);

/**
 * Starts the API Gateway server.
 */
function startServer() {
  app.listen(config.port, () => {
    console.log(`API Gateway running on port ${config.port}`);
  });
}

startServer();
