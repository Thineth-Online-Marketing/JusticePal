import cron from 'node-cron';
import prisma from '../lib/prisma';
import { sendRealTimeNotification } from './notificationHelper';

export const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    // Calculate a time window exactly 1 hour from the current execution time
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Query appointments where status is confirmed/scheduled, scheduledAt is within the next 1 hour
    const appointments = await prisma.appointment.findMany({
      where: {
        status: { in: ['confirmed', 'scheduled'] },
        scheduledAt: {
          lte: oneHourFromNow,
          gte: now,
        },
        // @ts-ignore: IDE TS Server caching issue for new Prisma field
        reminderSent: false,
      },
      include: {
        user: true,
        lawyer: true,
      },
    });

    for (const appointment of appointments) {
      const clientId = appointment.userId;
      // @ts-ignore: Cascading type error due to TS Server cache
      const lawyerUserId = appointment.lawyer.userId;

      const title = 'Upcoming Consultation Reminder';
      const message = 'Friendly reminder: You have a scheduled legal consultation in 1 hour.';
      const type = 'reminder';

      // Create notification for Client
      const clientNotification = await prisma.notification.create({
        data: {
          userId: clientId,
          title,
          message,
          type,
        },
      });
      // Dispatch immediately in real-time
      sendRealTimeNotification(clientId, clientNotification);

      // Create notification for Lawyer
      const lawyerNotification = await prisma.notification.create({
        data: {
          userId: lawyerUserId,
          title,
          message,
          type,
        },
      });
      // Dispatch immediately in real-time
      sendRealTimeNotification(lawyerUserId, lawyerNotification);

      // Mark appointment as reminder sent to prevent duplicate notifications
      await prisma.appointment.update({
        where: { id: appointment.id },
        // @ts-ignore: IDE TS Server caching issue for new Prisma field
        data: { reminderSent: true },
      });
    }

    if (appointments.length > 0) {
      console.log(`Sent reminders for ${appointments.length} appointments.`);
    }
  } catch (error) {
    console.error('Error running checkAndSendReminders:', error);
  }
};

export const initReminderScheduler = () => {
  // Initialize cron job to run automatically every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    console.log('Running background cron job: Appointment Reminders');
    checkAndSendReminders();
  });
  console.log('Reminder scheduler initialized');
};
