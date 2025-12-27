// back-end/utils/mailer.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST = "smtp.gmail.com",
  SMTP_PORT = "587",
  SMTP_SECURE = "false",          // 587 => false, 465 => true
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
  MAIL_FAILOPEN = "true",
  NODE_ENV,
} = process.env;

const secure = String(SMTP_SECURE).toLowerCase() === "true";
const port = Number(SMTP_PORT);

// Tạo transporter “mềm dẻo” hơn
function makeTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,                       // 465 => true, 587 => false
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    requireTLS: !secure,          // ép dùng STARTTLS khi port 587
    tls: {
      // Giúp 1 số mạng/proxy không resolve SNI tốt
      servername: SMTP_HOST,
      // Có thể mở khi dùng proxy/tường lửa “lạ”, không khuyến nghị prod:
      // rejectUnauthorized: false
    },
    // Ổn định hơn trên mạng chập chờn
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
  });
}

const transporter = makeTransport();

if (NODE_ENV !== "production") {
  transporter.verify((err, ok) => {
    if (err) {
      console.error("[MAILER] verify failed:", err.message);
      console.error(
        "[MAILER] Gợi ý: dùng PORT=587 + SMTP_SECURE=false; kiểm tra App Password; thử mạng khác/VPN."
      );
    } else {
      console.log("[MAILER] ready:", ok);
    }
  });
}

export async function sendOtpMail(to, otp) {
  if (!to) throw new Error("Missing recipient (to)");
  const from = MAIL_FROM || (SMTP_USER ? `DKStory <${SMTP_USER}>` : undefined);

  const mail = {
    from,
    to,
    subject: "DKStory - Mã OTP khôi phục mật khẩu",
    text: `Mã OTP của bạn: ${otp} (hiệu lực 10 phút)`,
    html: `
      <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif">
        <h2>DKStory</h2>
        <p>Mã OTP của bạn là:</p>
        <div style="font-size:20px;font-weight:700;letter-spacing:3px">${otp}</div>
        <p>OTP có hiệu lực trong <b>10 phút</b>.</p>
      </div>`,
  };

  try {
    return await transporter.sendMail(mail);
  } catch (err) {
    console.error("[MAILER] sendMail error:", err?.message || err);
    if (MAIL_FAILOPEN === "true") {
      console.warn("[MAILER] Fail-open enabled. Simulating email sent. OTP:", otp, "TO:", to);
      return { simulated: true };
    }
    throw err;
  }
}
