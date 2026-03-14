import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import lawyerRoutes from './routes/lawyerRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/justicepal';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'JusticePal Backend is running' });
});
app.use('/api/users', userRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/appointments', appointmentRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Database connection
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB. Running without DB connection.', error.message);
  });
