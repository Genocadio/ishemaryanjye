import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function (next) {
  try { 
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);

    if (!this.username) {
      return next(new Error('Username is required'));
    }

    if (!this.phone) {
      return next(new Error('Phone is required'));
    }

    if (!this.name) {
      return next(new Error('Name is required'));
    }
    next();
  } catch (error) {
    next(error as mongoose.CallbackError);
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema);