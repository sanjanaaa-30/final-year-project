import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'bot'], required: true },
    content: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema({
  id:       { type: String, required: true, unique: true, index: true },
  userId:   { type: String, index: true, default: 'legacy' },   // scopes sessions per user
  title:    { type: String, required: true },
  messages: { type: [messageSchema], default: [] },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
});

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema, 'chat_sessions');
