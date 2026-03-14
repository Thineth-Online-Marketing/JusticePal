import express from 'express';
import { getAppointments, createAppointment } from '../controllers/appointmentController';

const router = express.Router();

router.route('/').get(getAppointments).post(createAppointment);

export default router;
