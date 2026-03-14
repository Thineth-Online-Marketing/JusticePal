import mongoose, { Schema, Document } from 'mongoose';

export interface ILawyer extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string[];
  location: string;
  bio: string;
  isVerified: boolean;
  hourlyRate: number;
}

const LawyerSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: [{ type: String, required: true }],
  location: { type: String, required: true },
  bio: { type: String },
  isVerified: { type: Boolean, default: false },
  hourlyRate: { type: Number },
}, { timestamps: true });

export default mongoose.model<ILawyer>('Lawyer', LawyerSchema);
