import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  userId: mongoose.Types.ObjectId;
  lawyerId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  caseDescription: string;
  meetingLink?: string;
}

const AppointmentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  caseDescription: { type: String, required: true },
  meetingLink: { type: String },
}, { timestamps: true });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
