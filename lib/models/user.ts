import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    
    // Only hash the password if it's modified or new
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    
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

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);