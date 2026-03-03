import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IChannel extends Document {
  userOneId: string;
  userTwoId: string;
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    userOneId: { type: String, required: true, index: true },
    userTwoId: { type: String, required: true, index: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  {
    timestamps: true,
  }
);

// Optional: ensure unique channel between two users
channelSchema.index({ userOneId: 1, userTwoId: 1 }, { unique: true });

// If the model exists, use it, otherwise compile a new one
const Channel: Model<IChannel> = mongoose.models.Channel || mongoose.model<IChannel>('Channel', channelSchema);

export default Channel;
