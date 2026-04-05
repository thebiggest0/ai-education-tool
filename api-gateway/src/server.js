import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { authenticate } from './middleware/authenticate.js';
import { authController } from './controllers/authController.js';
import { passwordResetController } from './controllers/passwordResetController.js';
import { aiController } from './controllers/aiController.js';
import * as questionController from './controllers/questionController.js';
import * as responseController from './controllers/responseController.js';

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/refresh', authController.refresh);
app.post('/auth/logout', authenticate, authController.logout);
app.get('/auth/me', authenticate, authController.me);

app.post('/auth/forgot-password', passwordResetController.forgotPassword);
app.post('/auth/reset-password', passwordResetController.resetPassword);

app.post('/ai/prompt', authenticate, aiController.sendPrompt);

// Question endpoints - public reads for students
app.get('/questions/active-student', questionController.getActiveQuestionForStudent);

// Question endpoints - authenticated instructor operations
app.get('/questions/active', authenticate, questionController.getActiveQuestion);
app.get('/questions/instructor', authenticate, questionController.getInstructorQuestions);
app.get('/questions/:id', authenticate, questionController.getQuestion);
app.post('/questions', authenticate, questionController.createQuestion);
app.put('/questions/:id', authenticate, questionController.updateQuestion);
app.post('/questions/:id/activate', authenticate, questionController.activateQuestion);
app.post('/questions/:id/deactivate', authenticate, questionController.deactivateQuestion);
app.delete('/questions/:id', authenticate, questionController.deleteQuestion);

app.post('/responses', authenticate, responseController.saveResponse);
app.get('/responses/question/:questionId', authenticate, responseController.getResponseHistory);
app.get('/responses/user', authenticate, responseController.getAllUserResponses);

/**
 * Starts the API Gateway server.
 */
function startServer() {
  app.listen(config.port, () => {
    console.log(`API Gateway running on port ${config.port}`);
  });
}

startServer();
