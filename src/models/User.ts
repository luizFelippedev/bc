import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin';
  avatar?: string;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 8
  },
  role: { 
    type: String, 
    enum: ['admin'], 
    default: 'admin'
  },
  avatar: String,
  lastLogin: Date,
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Criptografar senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar senha
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', userSchema);