// back-end/routes/index.js
import { Router } from "express";

import users from "./users.js";
import authors from "./authors.js";
import novels from "./novels.js";
import chapters from "./chapters.js";
import comments from "./comments.js";
import favorites from "./favorites.js";
import followAuthorsRouter from "./followAuthors.js";
import notifications from "./notifications.js";
import genres from "./genres.js";
import health from "./health.js";
import posters from "./posters.js";
import auth from "./auth.js";
import paymentsSandbox from "./payments.sandbox.js";
import adminUsers from "./admin.users.js";
import adminNovels from "./admin.novels.js";  
import adminAuthors from "./admin.authors.js";
import adminChaptersRouter from "./admin.chapters.js"; // <- THÊM
import reportsRouter from "./reports.js";
import adminReportsRouter from "./admin.reports.js";
import chatsRouter from "./chats.js";
// ...




const router = Router();
router.use("/auth", auth);
router.use("/users", users);
router.use("/authors", authors);
router.use("/novels", novels);
router.use("/chapters", chapters);
router.use("/comments", comments);
router.use("/favorites", favorites);
//router.use("/follows", follows);
router.use("/notifications", notifications);
router.use("/genres", genres);
router.use("/posters", posters);
router.use("/reports", reportsRouter);
router.use("/payments", paymentsSandbox); 
router.use("/authors", followAuthorsRouter);
router.use("/chats", chatsRouter);
//admin
router.use("/admin/users", adminUsers);
router.use("/admin/novels", adminNovels);
router.use("/admin/authors", adminAuthors);
router.use("/admin/chapters", adminChaptersRouter);
router.use("/admin/reports", adminReportsRouter);


//router.use("/admin", adminReports); 


router.get("/health", (_, res) => res.json({ ok: true }));


export default router;
