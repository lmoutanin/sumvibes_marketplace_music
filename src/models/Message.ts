import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMessage extends Document {
  senderId: string;
  recipientId: string;
  channelId: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true, index: true },
    recipientId: { type: String, required: true, index: true },
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// If the model exists, use it, otherwise compile a new one
const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message;
