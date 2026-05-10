import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema(
  {
    name:                { type: String, required: true, trim: true },
    qualification:       { type: String, required: true },
    customQualification: { type: String, default: '' },
    stream:              { type: String, required: true },
    customStream:        { type: String, default: '' },
    experience:          { type: String, required: true },
    customExperience:    { type: String, default: '' },
    themeUsed:           { type: String, enum: ['dark', 'light'], default: 'dark' },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'user_profiles',
  }
);

export const UserProfile = mongoose.model('UserProfile', userProfileSchema);
