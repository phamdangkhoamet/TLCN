import mongoose from "mongoose";

const { Schema } = mongoose;

const chatMessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  content: { type: String, required: true, trim: true },
  readAt: { type: Date, default: null },
  conversationKey: { type: String, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

function buildConversationKey(a, b) {
  return [String(a), String(b)].sort().join(":");
}

chatMessageSchema.pre("validate", function (next) {
  if (!this.conversationKey && this.senderId && this.receiverId) {
    this.conversationKey = buildConversationKey(this.senderId, this.receiverId);
  }
  next();
});

chatMessageSchema.statics.buildConversationKey = buildConversationKey;

export default mongoose.model("ChatMessage", chatMessageSchema)