import mongoose, { Document, Schema } from 'mongoose';

export interface ITalent extends Document {
  name: string;
  email: string;
  skills: string[];
  level: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const TalentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  skills: { type: [String], default: [] },
  level: { type: Number, default: 1, min: 1, max: 10 },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
}, { timestamps: true });

export default mongoose.model<ITalent>('Talent', TalentSchema);
