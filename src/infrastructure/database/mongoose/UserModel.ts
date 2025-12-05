import 'reflect-metadata';
import mongoose, { Schema, Model } from 'mongoose';

// Framework & Driver: Mongoose schema and model for User
export interface UserDocument extends mongoose.Document {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: true, // Use custom _id field provided in document
    timestamps: false, // Use createdAt from domain entity
  },
);

// Create indexes (unique constraint on email)
UserSchema.index({ email: 1 }, { unique: true });

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>('User', UserSchema);

