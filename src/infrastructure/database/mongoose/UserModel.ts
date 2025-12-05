import 'reflect-metadata';
import mongoose, { Schema, Model } from 'mongoose';

// Embedded Product subdocument interface
export interface EmbeddedProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Framework & Driver: Mongoose schema and model for User
export interface UserDocument extends mongoose.Document {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  products: EmbeddedProduct[];
}

// Embedded product schema
const EmbeddedProductSchema = new Schema<EmbeddedProduct>(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }, // Don't auto-generate _id, use our custom one
);

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
    products: {
      type: [EmbeddedProductSchema],
      default: [],
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

