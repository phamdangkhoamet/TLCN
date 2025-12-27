import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js"; // hoặc: import connectDB from ...
import api from "./routes/index.js";
import usersRouter from "./routes/users.js";     // <— thêm dòng này
import sandboxPay from "./routes/payments.sandbox.js";
import followAuthorsRoutes from "./routes/followAuthors.js";
import adminNotificationsRouter from "./routes/admin.notifications.js";
import notificationsRouter from "./routes/notifications.js";
import reportsRouter from "./routes/reports.js";
import adminReportsRouter from "./routes/admin.reports.js";

// ...



const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_, res) => res.json({ ok: true, name: "DKStory API" }));
app.use("/api", api);
app.use("/api/users", usersRouter);
app.use("/api/authors", followAuthorsRoutes);
app.use("/api/admin/notifications", adminNotificationsRouter);
app.use("/api/notifications", notificationsRouter);
// User gửi report
app.use("/api/reports", reportsRouter);
// Admin xử lý report
app.use("/api/admin/reports", adminReportsRouter);


if (process.env.PAYMENTS_SANDBOX === "true") {
  app.use("/api/payments/sandbox", sandboxPay);
  console.log("[PAYMENTS] Sandbox mode enabled at /api/payments/sandbox");
}

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API ready at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("DB connect failed:", err);
    process.exit(1);
  });
