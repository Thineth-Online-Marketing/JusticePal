import express from 'express';
import { getAppointments, createAppointment, updateAppointmentStatus, rescheduleAppointment } from '../controllers/appointmentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getAppointments).post(protect, createAppointment);
router.route('/:id/status').patch(protect, updateAppointmentStatus);
router.route('/:id/reschedule').patch(protect, rescheduleAppointment);

export default router;
