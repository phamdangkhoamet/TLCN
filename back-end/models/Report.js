// back-end/models/Report.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    name: String,
    url: String, // base64 dataURL hoặc link lưu trữ
  },
  { _id: false }
);

const reportSchema = new Schema(
  {
    type: { type: String, enum: ["chapter", "novel", "comment", "other"], required: true },
    novelId: { type: Schema.Types.ObjectId, ref: "Novel" },
    chapterNo: Number,
    commentId: { type: Schema.Types.ObjectId, ref: "Comment" },  // <<< thêm

    reason: String,
    description: String,

    attachments: [attachmentSchema],

    userId: { type: Schema.Types.ObjectId, ref: "User" }, // nếu muốn gắn user báo cáo
    status: { type: String, enum: ["pending", "reviewing", "resolved", "rejected"], default: "pending" },
    lastAction: {
      type: String,
      enum: ["delete", "ban7d", "lock", null],
      default: null,
    },
    adminNote: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
