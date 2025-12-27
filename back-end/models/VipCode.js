// back-end/models/VipCode.js
import mongoose from "mongoose";

const vipCodeSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, index: true, required: true },

    type: { type: String, enum: ["DAY", "MONTH"], default: "DAY" },
    days: { type: Number, default: 1 }, // 1 ngày hoặc 30 ngày

    status: {
      type: String,
      enum: ["NEW", "USED", "EXPIRED"],
      default: "NEW",
    },

    source: {
      type: String,
      enum: ["WHEEL", "SANDBOX", "ADMIN"],
      default: "WHEEL",
    },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    usedAt: { type: Date },

    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("VipCode", vipCodeSchema);
