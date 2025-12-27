import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  avatar: String,
  role: { type: String, enum: ["user", "author", "admin"], default: "user" },
  status: { type: String, enum: ["active", "suspended"], default: "active" },

  // 👇 THÊM 2 TRƯỜNG VIP
  isVip: { type: Boolean, default: false },         // kích hoạt VIP “mãi mãi”
  vipUntil: { type: Date, default: null },          // VIP có thời hạn

  // --- Thêm cho Forgot Password ---
  resetOtpHash: { type: String, default: null },    // hash OTP
  resetOtpExpires: { type: Date, default: null },   // hạn của OTP

  createdAt: { type: Date, default: Date.now },
  followAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

});

// helper: coi là VIP nếu isVip = true hoặc vipUntil còn hạn
userSchema.methods.isVipNow = function () {
  if (this.isVip) return true;
  if (this.vipUntil && this.vipUntil > new Date()) return true;
  return false;
};

export default mongoose.model("User", userSchema);
