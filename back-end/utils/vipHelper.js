// back-end/utils/vipHelper.js
import User from "../models/User.js";

export async function addVipDaysToUser(userId, days) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User không tồn tại");

  const now = new Date();
  const base = user.vipUntil && user.vipUntil > now ? user.vipUntil : now;

  const newVipUntil = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  user.isVip = true;
  user.vipUntil = newVipUntil;

  await user.save();
  return user;
}
