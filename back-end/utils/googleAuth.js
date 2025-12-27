// back-end/utils/googleAuth.js
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Xác thực Google ID Token và trả về payload (thông tin user từ Google)
 * @param {string} idToken - credential mà front-end gửi lên
 */
export async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  // payload chứa: sub, email, name, picture...
  const payload = ticket.getPayload();
  return payload;
}
