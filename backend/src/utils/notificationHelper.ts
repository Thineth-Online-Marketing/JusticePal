import { Server } from 'socket.io';

let ioInstance: Server | null = null;

export const initNotificationSocket = (io: Server) => {
  ioInstance = io;
};

export const sendRealTimeNotification = (userId: string, notificationData: any) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('new_notification', notificationData);
  } else {
    console.warn('Socket.io instance not initialized for notifications');
  }
};
