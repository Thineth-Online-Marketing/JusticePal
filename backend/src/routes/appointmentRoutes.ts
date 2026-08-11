import express from 'express';
import { getAppointments, getActiveAppointments, createAppointment, updateAppointmentStatus, rescheduleAppointment } from '../controllers/appointmentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getAppointments).post(protect, createAppointment);
router.route('/active').get(protect, getActiveAppointments);
router.route('/:id/status').patch(protect, updateAppointmentStatus);
router.route('/:id/reschedule').patch(protect, rescheduleAppointment);

export default router;
