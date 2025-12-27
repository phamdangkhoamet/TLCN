export function grantVip(userDoc, plan) {
    // Kéo dài vipUntil theo plan
    let base = (userDoc.vipUntil && userDoc.vipUntil > new Date())
      ? new Date(userDoc.vipUntil)
      : new Date();
  
    if (plan === "1d") base.setDate(base.getDate() + 1);
    else base.setMonth(base.getMonth() + 1);
  
    userDoc.vipUntil = base;
    userDoc.isVip = true;
    return userDoc.save();
  }
  