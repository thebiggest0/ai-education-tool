import express from 'express';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import { requireInternalSecret } from './middleware/internalAuth.js';
import { userController } from './controllers/userController.js';
import { tokenController } from './controllers/tokenController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(requireInternalSecret);

app.post('/internal/users/create', userController.createUser);
app.post('/internal/users/find', userController.findUser);
app.get('/internal/users/:id', userController.getUserById);
app.put('/internal/users/:id/role', userController.updateUserRole);

app.post('/internal/tokens/store', tokenController.storeToken);
app.post('/internal/tokens/verify', tokenController.verifyToken);
app.post('/internal/tokens/rotate', tokenController.rotateToken);
app.delete('/internal/tokens/revoke', tokenController.revokeToken);

/**
 * Starts the data service server and initializes the database schema.
 */
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Data Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Data Service:', error);
    process.exit(1);
  }
}

startServer();
